const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../config/db');
const { verifyAdmin } = require('../middleware/auth');
const Flutterwave = require('flutterwave-node-v3');
const { parsePagination, createPaginationMeta, createPaginatedResponse } = require('../utils/pagination');

// Initialize Flutterwave payment
router.post('/initialize', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
    .toFloat(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 255 }),
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Full name is required and must be less than 200 characters')
    .escape(),
  body('purpose')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .escape(),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .escape(),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, email, fullName, purpose, message, isRecurring } = req.body;

    const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY;
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

    if (!FLW_PUBLIC_KEY || !FLW_SECRET_KEY) {
      return res.status(500).json({ error: 'Flutterwave credentials not configured' });
    }

    const flw = new Flutterwave(FLW_PUBLIC_KEY, FLW_SECRET_KEY);
    const txRef = 'hcm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Store initial donation data in database (pending status)
    const db = getDB();
    // Currency can be configured via environment variable, default to NGN
    const currency = process.env.FLW_CURRENCY || 'NGN';

    const donationData = {
      tx_ref: txRef,
      amount: parseFloat(amount),
      currency: currency,
      email: email,
      fullName: fullName,
      purpose: purpose || 'General Offering',
      message: message || '',
      isRecurring: isRecurring || false,
      status: 'pending',
      date: new Date(),
      createdAt: new Date()
    };

    await db.collection('donations').insertOne(donationData);

    const payload = {
      tx_ref: txRef,
      amount: parseFloat(amount),
      currency: currency,
      redirect_url: `${baseUrl}/donate.html?tx_ref=${txRef}&status=success`,
      payment_options: 'card,ussd,banktransfer,account',
      customer: {
        email: email,
        name: fullName
      },
      customizations: {
        title: 'HCM International Donation',
        description: purpose || 'Donation to Heavenly Concordance Ministry',
        logo: `${baseUrl}/images/logo.png`
      },
      meta: {
        purpose: purpose || 'General Offering',
        message: message || ''
      }
    };

    const response = await flw.Payment.initialize(payload);
    
    if (response.status === 'success') {
      res.json({ 
        payment_link: response.data.link,
        tx_ref: txRef
      });
    } else {
      // Update donation status to failed
      await db.collection('donations').updateOne(
        { tx_ref: txRef },
        { $set: { status: 'failed', error: response.message || 'Payment initialization failed' } }
      );
      res.status(400).json({ error: 'Failed to initialize payment' });
    }
  } catch (error) {
    console.error('Flutterwave initialization error:', error);
    res.status(500).json({ error: error.message || 'Payment initialization failed' });
  }
});

// Flutterwave webhook for payment verification
// Note: This route must be before express.json() middleware to receive raw body
router.post('/webhook', async (req, res) => {
  try {
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH;

    if (!FLW_SECRET_KEY) {
      return res.status(500).json({ error: 'Flutterwave secret key not configured' });
    }

    // Parse the event data
    const event = req.body;

    // Verify webhook signature if secret hash is provided
    if (FLW_SECRET_HASH && req.headers['verif-hash']) {
      const hash = crypto
        .createHmac('sha256', FLW_SECRET_HASH)
        .update(JSON.stringify(event))
        .digest('hex');
      
      const signature = req.headers['verif-hash'];
      if (hash !== signature) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
    const db = getDB();

    // Handle different event types
    if (event.event === 'charge.completed' || event.event === 'charge.completed.redirect') {
      const transactionData = event.data;
      const txRef = transactionData.tx_ref;
      const status = transactionData.status;
      const amount = transactionData.amount;
      const currency = transactionData.currency;
      const paymentId = transactionData.id;
      const customerEmail = transactionData.customer?.email;
      const customerName = transactionData.customer?.name;

      // Verify transaction with Flutterwave
      const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, FLW_SECRET_KEY);
      const verification = await flw.Transaction.verify({ id: paymentId });

      if (verification.status === 'success' && verification.data.status === 'successful') {
        // Update donation status to completed
        await db.collection('donations').updateOne(
          { tx_ref: txRef },
          {
            $set: {
              status: 'completed',
              paymentId: paymentId,
              paidAt: new Date(),
              verifiedAt: new Date(),
              amount: parseFloat(verification.data.amount),
              currency: verification.data.currency || 'NGN',
              paymentMethod: verification.data.payment_type || 'unknown',
              flwRef: verification.data.flw_ref
            }
          }
        );
        console.log(`Donation ${txRef} verified and saved successfully`);
      } else {
        // Payment failed
        await db.collection('donations').updateOne(
          { tx_ref: txRef },
          {
            $set: {
              status: 'failed',
              paymentId: paymentId,
              error: verification.data?.processor_response || 'Payment verification failed'
            }
          }
        );
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment status endpoint (for frontend polling or direct verification)
router.get('/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

    if (!FLW_SECRET_KEY) {
      return res.status(500).json({ error: 'Flutterwave secret key not configured' });
    }

    const db = getDB();
    const donation = await db.collection('donations').findOne({ tx_ref: tx_ref });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // If already verified, return status
    if (donation.status === 'completed') {
      return res.json({
        status: 'success',
        donation: {
          tx_ref: donation.tx_ref,
          amount: donation.amount,
          currency: donation.currency,
          status: donation.status,
          date: donation.date
        }
      });
    }

    // If payment ID exists, verify with Flutterwave
    if (donation.paymentId) {
      const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, FLW_SECRET_KEY);
      try {
        const verification = await flw.Transaction.verify({ id: donation.paymentId });

        if (verification.status === 'success' && verification.data.status === 'successful') {
          // Update donation status
          await db.collection('donations').updateOne(
            { tx_ref: tx_ref },
            {
              $set: {
                status: 'completed',
                paidAt: new Date(),
                verifiedAt: new Date(),
                amount: parseFloat(verification.data.amount),
                currency: verification.data.currency || 'NGN',
                paymentMethod: verification.data.payment_type || 'unknown',
                flwRef: verification.data.flw_ref
              }
            }
          );

          return res.json({
            status: 'success',
            donation: {
              tx_ref: tx_ref,
              amount: parseFloat(verification.data.amount),
              currency: verification.data.currency || 'NGN',
              status: 'completed',
              date: new Date()
            }
          });
        } else {
          await db.collection('donations').updateOne(
            { tx_ref: tx_ref },
            {
              $set: {
                status: 'failed',
                error: verification.data?.processor_response || 'Payment verification failed'
              }
            }
          );
        }
      } catch (verifyError) {
        console.error('Verification error:', verifyError);
      }
    }

    // Return current status
    res.json({
      status: donation.status === 'completed' ? 'success' : 'pending',
      donation: {
        tx_ref: donation.tx_ref,
        amount: donation.amount,
        currency: donation.currency,
        status: donation.status
      }
    });
  } catch (error) {
    console.error('Verification endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('donations').insertOne({ ...req.body, date: new Date() });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    
    // Get total count for pagination metadata
    const total = await db.collection('donations').countDocuments({});
    
    // Get paginated donations
    const donations = await db.collection('donations')
      .find({})
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const pagination = createPaginationMeta(page, limit, total);
    const response = createPaginatedResponse(donations, pagination);
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

