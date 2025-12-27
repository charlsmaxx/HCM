# How to Set Up Admin User in Supabase

## Method 1: Using Supabase Dashboard (Manual)

### Step-by-Step Instructions:

1. **Log in to Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to Authentication**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Users"** tab

3. **Create or Select a User**
   - If you don't have a user yet, click **"Add User"** button
   - Enter an email and password for your admin account
   - Click **"Create User"**
   - If user already exists, click on the user's email to open their details

4. **Add Admin Role to User Metadata**
   - In the user details page, scroll down to find the metadata sections
   - Look for **"Raw App Meta Data"** or **"Raw User Meta Data"** section
   - Click the **"Edit"** button (or pencil icon) next to it
   - You'll see a JSON editor
   
   **Important:** The current code checks `user_metadata`, but for better security, we'll use `app_metadata` (which only admins can modify).
   
   - In the JSON editor, add or update:
   ```json
   {
     "role": "admin"
   }
   ```
   
   - Click **"Save"** or **"Update"**

5. **Verify the Metadata**
   - After saving, you should see the metadata displayed with `"role": "admin"`
   - The user is now an admin!

### Alternative: If you see "User Metadata" instead

If the Supabase UI shows "User Metadata" instead of "Raw App Meta Data":
- Click on **"User Metadata"** section
- Click **"Edit"**
- Add:
```json
{
  "role": "admin"
}
```
- Save

## Method 2: Using Supabase Admin API (Programmatic)

This method uses the Service Role key to update user metadata programmatically.

### Prerequisites:
- Your Supabase Service Role Key (found in Settings > API > Service Role key)
- The User ID from Supabase (found in Authentication > Users > click on user)

### Using cURL:

```bash
curl -X PATCH 'https://YOUR_PROJECT.supabase.co/auth/v1/admin/users/USER_ID' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "app_metadata": {
      "role": "admin"
    }
  }'
```

Replace:
- `YOUR_PROJECT` with your Supabase project reference
- `USER_ID` with the user's UUID
- `YOUR_SERVICE_ROLE_KEY` with your Service Role key

### Using Node.js Script:

See `setup-admin-user.js` in the scripts folder for a helper script.

## Method 3: Using Supabase SQL Editor (Advanced)

You can also use the SQL Editor in Supabase:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query (replace USER_ID with your user's UUID):

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE id = 'USER_ID';
```

## Troubleshooting

### I can't find "Raw App Meta Data" section
- Make sure you're viewing the user details page (click on the user's email/row)
- Look for sections like "User Metadata", "App Metadata", or "Raw User Meta Data"
- The UI may vary depending on your Supabase version

### The role is saved but login still fails
- **Check the code:** The current code checks `user_metadata.role`, but we should use `app_metadata.role` for security
- **Clear browser cache** and try logging in again
- **Check browser console** for error messages
- **Verify the metadata** is saved correctly in Supabase dashboard

### I want to use app_metadata instead (More Secure)
The current code uses `user_metadata`, but `app_metadata` is more secure because:
- Only admins can modify `app_metadata`
- Users cannot change their own `app_metadata`
- `user_metadata` is user-editable, which is a security risk

To switch to `app_metadata`, the code needs to be updated. See the code update guide.

## Next Steps

After setting up the admin user:
1. Start your server: `npm start` or `npm run dev`
2. Go to: `http://localhost:3000/admin/login.html`
3. Log in with your admin email and password
4. You should be redirected to the admin dashboard!

## Security Note

⚠️ **Important:** Store role information in `app_metadata` (not `user_metadata`) to prevent users from modifying their own roles. The current implementation uses `user_metadata`, which is less secure.


