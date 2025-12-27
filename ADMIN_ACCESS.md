# How to Access the Admin Page

This guide will help you set up and access the admin dashboard for your HCM website.

## Prerequisites

1. **Supabase Account** - You need a Supabase project set up
2. **Environment Variables** - Your `.env` file must have Supabase credentials
3. **Admin User** - You need to create an admin user in Supabase

## Step 1: Verify Your Environment Variables

Make sure your `.env` file contains your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

If these are missing:
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the **Project URL** and **anon public** key
5. Add them to your `.env` file

## Step 2: Create an Admin User in Supabase

You need to create a user in Supabase and assign them the admin role.

### Option A: Use the Setup Script (Easiest - Recommended)

1. **Add Service Role Key to .env file**:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   (Find it in: Supabase Dashboard > Settings > API > Service Role key)

2. **Create a user in Supabase** (if you don't have one):
   - Go to Supabase Dashboard > Authentication > Users
   - Click "Add User"
   - Enter email and password
   - Click "Create User"

3. **Run the setup script** (from project root):
   ```bash
   # Make sure you're in the project root directory (HCM/)
   node server/scripts/setup-admin-user.js user@example.com
   ```
   Replace `user@example.com` with your admin user's email.
   
   **Note:** If you're in the `server` directory, use:
   ```bash
   node scripts/setup-admin-user.js user@example.com
   ```

This script will automatically set the admin role for you!

### Option B: Create User via Supabase Dashboard (Manual)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** > **Users**
4. Click **"Add User"** (or **"Invite User"**)
5. Enter an email and password for your admin account
6. Click **"Create User"**
7. After the user is created, **click on the user's email** to open their details page
8. Scroll down to find **"Raw App Meta Data"** or **"App Metadata"** section
   - If you don't see it, look for **"User Metadata"** section
   - **Note:** App Metadata is more secure (only admins can modify it)
9. Click **"Edit"** button (usually a pencil icon)
10. Add the following JSON:

```json
{
  "role": "admin"
}
```

11. Click **"Save"**

**See `HOW_TO_FIND_RAW_META_DATA.md` for detailed visual instructions.**

### Option C: Create User via Supabase Auth API

If you prefer to create the user programmatically, you can use the Supabase Auth API or create a signup script.

## Step 3: Start Your Server

Make sure your server is running:

```bash
npm start
```

Or for development:

```bash
npm run dev
```

## Step 4: Access the Admin Login Page

1. Open your browser
2. Navigate to: `http://localhost:3000/admin/login.html`
   - Replace `localhost:3000` with your domain if deployed

## Step 5: Log In

1. Enter the **email** you used when creating the admin user
2. Enter the **password** you set for the admin user
3. Click **"Login"**

If successful, you'll be redirected to the admin dashboard at `/admin/`.

## Troubleshooting

### Error: "Supabase configuration is missing"

**Solution:** Check your `.env` file has `SUPABASE_URL` and `SUPABASE_ANON_KEY` set correctly. Make sure you've restarted your server after adding them.

### Error: "Invalid login credentials"

**Solution:** 
- Verify the email and password are correct
- Make sure the user exists in Supabase Authentication > Users
- Try resetting the password in Supabase dashboard

### Error: "You do not have admin access"

**Solution:** 
- The user doesn't have the `admin` role in their metadata
- **Easy fix:** Use the setup script: `node server/scripts/setup-admin-user.js user@example.com`
- **Manual fix:** Go to Supabase Dashboard > Authentication > Users
- Click on the user's email to open details
- Edit the user and add `{"role": "admin"}` to the App Metadata (or User Metadata)
- See `HOW_TO_FIND_RAW_META_DATA.md` for detailed instructions

### Error: "Configuration error"

**Solution:**
- Check that your server is running
- Verify `/api/config` endpoint is accessible (visit `http://localhost:3000/api/config` in your browser)
- Check server logs for errors

### Can't Access Admin Pages After Login

**Solution:**
- Check browser console for errors
- Verify the auth token is stored in localStorage (open browser DevTools > Application > Local Storage)
- Make sure the token hasn't expired (Supabase tokens expire after some time)

### Token Expired

If your token expires, you'll be redirected to the login page. Simply log in again.

## Admin Dashboard Features

Once logged in, you can:
- **Dashboard** - View statistics and quick actions
- **Sermons** - Manage sermon content
- **Events** - Create and manage events
- **Blog** - Manage blog posts
- **Team** - Manage team members
- **Testimonials** - Manage testimonials
- **Gallery** - Manage gallery images
- **Donations** - View donation records
- **Prayer Requests** - View and manage prayer requests
- **Settings** - Update site settings

## Security Notes

1. **Keep your credentials secure** - Never share your `.env` file or commit it to version control
2. **Use strong passwords** - Your admin account should have a strong, unique password
3. **Limit admin users** - Only create admin users for trusted individuals
4. **Monitor access** - Regularly check your Supabase Authentication logs for suspicious activity

## Need Help?

If you're still having issues:
1. Check the server logs for error messages
2. Check the browser console for JavaScript errors
3. Verify all environment variables are set correctly
4. Make sure your Supabase project is active and accessible

