# Admin Login Help Guide

If you can't login to the admin page, follow these steps:

## Step 1: Check Browser Console for Errors

1. Open the admin login page: `http://localhost:3000/admin/login.html`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for any error messages

Common errors:
- **CSP errors**: Content Security Policy blocking Supabase
- **Configuration errors**: Missing Supabase credentials
- **Network errors**: Server not running or API endpoint issues

## Step 2: Verify Supabase Configuration

1. Check your `.env` file has:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Restart your server after updating `.env`

3. Test the config endpoint: Visit `http://localhost:3000/api/config`
   - Should return JSON with `supabaseUrl` and `supabaseKey`

## Step 3: Recover Admin Access

### Option A: Use the Recovery Script (Recommended)

1. Make sure your `.env` file has `SUPABASE_SERVICE_ROLE_KEY` set

2. Open a terminal in the project directory (`C:\Users\HP PC\Desktop\HCM`)

3. Run the recovery script:
   ```bash
   node server/scripts/recover-admin.js
   ```

4. Follow the prompts:
   - Choose option 1 to list all users
   - Choose option 2 to reset a password
   - Choose option 3 to make a user admin
   - Choose option 4 to create a new admin user

### Option B: Manual Setup via Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** > **Users**
4. Find your user (or create a new one)
5. Click on the user's email
6. Scroll to **App Metadata** section
7. Click **Edit** (pencil icon)
8. Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
9. Click **Save**

10. If you need to reset the password:
    - Click **Reset Password** button in the user details
    - Or use the recovery script (Option A)

## Step 4: Try Logging In Again

1. Go to `http://localhost:3000/admin/login.html`
2. Enter your email and password
3. Click **Login**

## Common Issues and Solutions

### Issue: "Supabase not initialized"
**Solution**: Check browser console for CSP errors. The server needs to allow Supabase connections.

### Issue: "You do not have admin access"
**Solution**: 
- Make sure the user has `role: "admin"` in **App Metadata** (not User Metadata)
- Use the recovery script to assign admin role

### Issue: "Invalid email or password"
**Solution**:
- Use the recovery script to reset the password
- Or reset password via Supabase Dashboard

### Issue: CSP Errors in Console
**Solution**: 
- The server CSP has been updated to allow Supabase
- Make sure you've restarted the server after the CSP changes

## Quick Recovery Commands

If you have the Service Role Key in your `.env`:

```bash
# List all users
node server/scripts/recover-admin.js
# Then choose option 1

# Reset password for a user
node server/scripts/recover-admin.js
# Then choose option 2 and enter the email

# Make user admin
node server/scripts/recover-admin.js
# Then choose option 3 and enter the email

# Create new admin user
node server/scripts/recover-admin.js
# Then choose option 4
```

## Still Having Issues?

1. Check the browser console (F12) for specific error messages
2. Check server terminal for any error logs
3. Verify your `.env` file has all required Supabase credentials
4. Make sure the server is running and restarted after any `.env` changes

