require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const TESTIMONIALS = [
  {
    name: 'Priscilla Brooks',
    testimonial: 'We\'re saved so we can serve, and there\'s a unique role only you can play in changing lives for the better.',
    location: 'Church Member',
    image: null,
    date: new Date('2023-09-15')
  },
  {
    name: 'John Smith',
    testimonial: 'This church has been a beacon of hope in my life. The community here truly embodies God\'s love and grace.',
    location: 'Volunteer',
    image: null,
    date: new Date('2023-10-08')
  },
  {
    name: 'Sarah Johnson',
    testimonial: 'Through this ministry, I\'ve found my purpose and learned to walk in faith every single day.',
    location: 'Faith Partner',
    image: null,
    date: new Date('2023-11-21')
  },
  {
    name: 'Michael Brown',
    testimonial: 'The sermons here have transformed my understanding of God\'s word and deepened my relationship with Christ.',
    location: 'Member',
    image: null,
    date: new Date('2024-01-12')
  },
  {
    name: 'Emily Davis',
    testimonial: 'This church family has supported me through my darkest times and celebrated with me in my greatest joys.',
    location: 'Choir Lead',
    image: null,
    date: new Date('2024-02-18')
  }
];

async function seedTestimonials() {
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables. Please set it before running this script.');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('hcm_church');
    const testimonialsCollection = db.collection('testimonials');

    let insertedCount = 0;
    let skippedCount = 0;

    for (const testimonial of TESTIMONIALS) {
      const existing = await testimonialsCollection.findOne({
        name: testimonial.name,
        testimonial: testimonial.testimonial
      });

      if (existing) {
        skippedCount += 1;
        console.log(`Skipping existing testimonial for ${testimonial.name}`);
        continue;
      }

      await testimonialsCollection.insertOne({
        ...testimonial,
        text: testimonial.testimonial,
        approved: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      insertedCount += 1;
      console.log(`Inserted testimonial for ${testimonial.name}`);
    }

    console.log('\nSeeding complete.');
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Skipped (already existed): ${skippedCount}`);
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

seedTestimonials();


