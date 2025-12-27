# HCM Church Website - Setup Instructions

## Quick Setup Guide

### Step 1: Create Environment File

1. In the root directory, create a file named `.env` (without any extension)
2. Copy the contents from `env.example` into the `.env` file
3. Fill in your actual credentials:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
PORT=3000
```

### Step 2: Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create an account or log in
3. Create a new cluster (Free tier is fine)
4. Click "Connect" on your cluster
5. Select "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Add it to your `.env` file as `MONGODB_URI`

### Step 3: Get Your Supabase Credentials

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be set up
4. Go to Settings > API
5. Copy your Project URL and anon public key
6. Add them to your `.env` file as `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Step 4: Set Up Supabase Storage Buckets

1. In Supabase dashboard, go to Storage
2. Create the following buckets:
   - `sermons-audio` (Make it public)
   - `sermons-video` (Make it public)
   - `images` (Make it public)

3. For each bucket, set the policies:
   - Public buckets: Allow public read access
   - Admin write: You'll configure this in Supabase dashboard

### Step 5: Create an Admin User in Supabase

1. In Supabase dashboard, go to Authentication > Users
2. Click "Add User" and create an account
3. After creating the user, edit the user
4. In the "Raw App Meta Data" section, add:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save the user email and password for admin login

### Step 6: Set Up Flutterwave Payment Gateway

1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Create an account or log in
3. Go to Settings > API Keys
4. Copy your **Public Key** and **Secret Key**
   - For testing, use test keys (starts with `FLWPUBK_TEST` and `FLWSECK_TEST`)
   - For production, use live keys (starts with `FLWPUBK` and `FLWSECK`)
5. Add them to your `.env` file:
   ```env
   FLW_PUBLIC_KEY=FLWPUBK_TEST-your_key_here
   FLW_SECRET_KEY=FLWSECK_TEST-your_key_here
   ```

#### Setting Up Webhooks (Recommended for Production)

1. In Flutterwave dashboard, go to Settings > Webhooks
2. Click "Add Webhook"
3. Set the webhook URL:
   - **Production**: `https://yourdomain.com/api/donations/webhook`
   - **Development**: Use a tool like [ngrok](https://ngrok.com) to expose your local server:
     ```bash
     ngrok http 3000
     ```
     Then use: `https://your-ngrok-url.ngrok.io/api/donations/webhook`
4. Select events to listen for:
   - `charge.completed`
   - `charge.completed.redirect`
5. Generate and copy the **Secret Hash**
6. Add it to your `.env` file:
   ```env
   FLW_SECRET_HASH=your_secret_hash_here
   ```

**Note**: The webhook ensures that donations are properly recorded even if users close their browser after payment. Without the webhook, payments are still verified when users return to the site.

### Step 7: Run the Server

Now that everything is set up, you can start the server:

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The website should now be accessible at `http://localhost:3000`

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'startsWith')"

This means your `.env` file is missing or incomplete. Make sure:
- You created a `.env` file (not `.env.txt`)
- You filled in all the required values
- You didn't add extra spaces or quotes around the values

### MongoDB Connection Issues

- Make sure your IP is whitelisted in MongoDB Atlas Network Access
- Verify your username and password in the connection string
- Check that your cluster is running

### Supabase Connection Issues

- Verify your project URL and anon key
- Make sure your Supabase project is active
- Check that you've set up the storage buckets

### Flutterwave Payment Issues

- Verify your API keys are correct (test vs live keys)
- Check that your webhook URL is accessible (use ngrok for local testing)
- Ensure your webhook secret hash matches the one in Flutterwave dashboard
- Test payments using Flutterwave test cards (see Flutterwave documentation)
- Check server logs for payment verification errors

## Next Steps

After setup, you can:
1. Visit `http://localhost:3000` to see the public website
2. Visit `http://localhost:3000/admin/login.html` to access the admin dashboard
3. Upload sermons, manage events, and customize your website

## Need Help?

If you encounter any issues, check the browser console and server logs for detailed error messages.





