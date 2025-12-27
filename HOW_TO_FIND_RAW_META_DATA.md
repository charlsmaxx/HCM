# How to Find "Raw App Meta Data" in Supabase Dashboard

## Visual Guide to Setting Admin Role

### Step 1: Access Supabase Dashboard
1. Go to **https://app.supabase.com**
2. Log in with your Supabase account
3. Select your project from the project list

### Step 2: Navigate to Users
1. In the left sidebar, click on **"Authentication"** (usually has a key/lock icon)
2. Click on the **"Users"** tab (you should see a list of users)

### Step 3: Open User Details
1. Find the user you want to make admin in the users list
2. **Click on the user's email address** (this opens the user details page)
3. You'll see the user's information page with multiple sections

### Step 4: Locate Metadata Section
The metadata section can be found in different places depending on your Supabase version:

#### Option A: Modern Supabase UI (Most Common)
- Scroll down on the user details page
- Look for a section called **"Raw App Meta Data"** or **"App Metadata"**
- You should see a JSON editor or a view with curly braces `{}`
- Click the **"Edit"** button (usually a pencil icon) or **"Edit Metadata"** button

#### Option B: If you see "User Metadata" instead
- Look for **"User Metadata"** section
- Click **"Edit"** button
- This will open a JSON editor

#### Option C: If you see both sections
- **Prefer "App Metadata"** (more secure - only admins can change it)
- If not available, use "User Metadata"

### Step 5: Edit the Metadata
1. In the JSON editor, you'll see something like:
   ```json
   {}
   ```
   or
   ```json
   {
     "some_existing_key": "value"
   }
   ```

2. **Add or update** the role field:
   ```json
   {
     "role": "admin"
   }
   ```
   
   If there's already content, add the role field:
   ```json
   {
     "existing_key": "existing_value",
     "role": "admin"
   }
   ```

3. Click **"Save"** or **"Update"** button

### Step 6: Verify
- After saving, you should see the metadata displayed with `"role": "admin"`
- The user is now an admin!

## Alternative: Quick Method Using Script

Instead of manually editing in the dashboard, you can use the provided script:

1. **Add Service Role Key to .env**:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   (Find it in: Settings > API > Service Role key)

2. **Run the script**:
   ```bash
   node server/scripts/setup-admin-user.js user@example.com
   ```

This will automatically set the admin role for you!

## Troubleshooting

### "I can't find the metadata section"
- Make sure you clicked on the user's email to open the details page
- Try scrolling down further on the page
- Look for sections like: "Metadata", "App Metadata", "User Metadata", "Raw App Meta Data"

### "I see the section but can't edit it"
- Make sure you're logged in as a project owner/admin
- Try refreshing the page
- Check if there's an "Edit" button or pencil icon

### "The UI looks different"
- Supabase updates their UI regularly
- Look for any section related to "metadata" or "data"
- You can also use the script method (easier and more reliable)

### "I want to verify it worked"
- After saving, the metadata should show `"role": "admin"`
- Try logging in at `http://localhost:3000/admin/login.html`
- If it still doesn't work, check the browser console for errors

## Screenshot Locations (What to Look For)

When you're on the user details page, look for:

1. **Section headers** that say:
   - "App Metadata"
   - "User Metadata"  
   - "Raw App Meta Data"
   - "Raw User Meta Data"
   - "Metadata"

2. **Edit buttons** that look like:
   - Pencil icon ✏️
   - "Edit" text button
   - "Edit Metadata" button

3. **JSON content** displayed in a code block or editor with curly braces

## Quick Checklist

- [ ] Logged into Supabase Dashboard
- [ ] Selected the correct project
- [ ] Navigated to Authentication > Users
- [ ] Clicked on user's email to open details
- [ ] Found metadata section (App Metadata or User Metadata)
- [ ] Clicked Edit button
- [ ] Added `{"role": "admin"}` to JSON
- [ ] Clicked Save
- [ ] Verified metadata shows the role
- [ ] Tested login at `/admin/login.html`

## Still Having Issues?

If you're still having trouble finding it:
1. **Use the script method** - It's easier and more reliable
2. **Check Supabase documentation** - https://supabase.com/docs/guides/auth/users
3. **Contact support** - The Supabase team can help guide you


