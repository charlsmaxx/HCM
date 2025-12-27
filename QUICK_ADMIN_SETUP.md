# Quick Admin Setup Guide

## 🚀 Fastest Way to Set Up Admin Access

### Method 1: Using the Setup Script (Recommended - 2 minutes)

1. **Get your Supabase Service Role Key**:
   - Go to Supabase Dashboard > Settings > API
   - Copy the **"service_role"** key (keep it secret!)

2. **Add it to your .env file**:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Create a user in Supabase** (if needed):
   - Go to Authentication > Users
   - Click "Add User"
   - Enter email and password
   - Click "Create User"

4. **Run the setup script** (from project root):
   ```bash
   # Make sure you're in the project root directory (HCM/)
   node server/scripts/setup-admin-user.js your-email@example.com
   ```
   
   **Note:** If you're in the `server` directory, use:
   ```bash
   node scripts/setup-admin-user.js your-email@example.com
   ```

5. **Done!** You can now log in at `http://localhost:3000/admin/login.html`

---

### Method 2: Manual Setup via Dashboard (5 minutes)

1. **Go to Supabase Dashboard**: https://app.supabase.com

2. **Navigate to Users**:
   - Click "Authentication" in left sidebar
   - Click "Users" tab

3. **Create or Select User**:
   - Click "Add User" (if creating new user)
   - Enter email and password
   - Click "Create User"
   - **OR** click on existing user's email

4. **Add Admin Role**:
   - Scroll down to find **"App Metadata"** or **"User Metadata"** section
   - Click **"Edit"** button (pencil icon)
   - Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
   - Click **"Save"**

5. **Login**: Go to `http://localhost:3000/admin/login.html`

**📖 Need more details?** See `HOW_TO_FIND_RAW_META_DATA.md`

---

## 📍 Where to Find Things in Supabase

### Service Role Key
- **Location**: Settings > API > Service Role key
- **Used for**: Admin operations (like setting user roles)
- **Keep it secret!** Never commit to git

### User Metadata
- **Location**: Authentication > Users > [Click user email] > App Metadata / User Metadata
- **What to add**: `{"role": "admin"}`
- **Prefer**: App Metadata (more secure)

### Project URL & Anon Key
- **Location**: Settings > API
- **Used for**: Client-side authentication
- **Safe to use**: In frontend code

---

## ✅ Verification Checklist

- [ ] Supabase URL and Anon Key in `.env`
- [ ] Service Role Key in `.env` (for script method)
- [ ] User created in Supabase
- [ ] Admin role added to user metadata
- [ ] Server running (`npm start`)
- [ ] Can access `/admin/login.html`
- [ ] Can log in with admin credentials
- [ ] Redirected to admin dashboard

---

## 🔧 Troubleshooting

### "Can't find metadata section"
→ See `HOW_TO_FIND_RAW_META_DATA.md` for visual guide

### "Script says user not found"
→ Make sure user exists in Supabase Authentication > Users
→ Check the email address is correct

### "Login fails after setting role"
→ Clear browser cache
→ Check browser console for errors
→ Verify metadata was saved in Supabase dashboard
→ Make sure server is restarted after .env changes

### "Configuration error"
→ Check `.env` file has `SUPABASE_URL` and `SUPABASE_ANON_KEY`
→ Restart server after adding environment variables
→ Test `/api/config` endpoint in browser

---

## 📚 More Help

- **Detailed setup**: `ADMIN_ACCESS.md`
- **Finding metadata**: `HOW_TO_FIND_RAW_META_DATA.md`
- **Complete guide**: `ADMIN_SETUP_GUIDE.md`

---

## 🎯 Quick Command Reference

```bash
# Setup admin user (requires SUPABASE_SERVICE_ROLE_KEY in .env)
# Run from project root:
node server/scripts/setup-admin-user.js user@example.com

# Or if you're in the server directory:
node scripts/setup-admin-user.js user@example.com

# Start server
npm start

# Start server (development)
npm run dev

# Test config endpoint
curl http://localhost:3000/api/config
```

---

## 🔒 Security Notes

1. **App Metadata vs User Metadata**:
   - ✅ **App Metadata**: Only admins can modify (more secure)
   - ⚠️ **User Metadata**: Users can modify (less secure)
   - The code checks both, but prefers App Metadata

2. **Service Role Key**:
   - Never commit to git
   - Keep in `.env` file (already in `.gitignore`)
   - Only use for admin operations

3. **Admin Access**:
   - Only give admin role to trusted users
   - Use strong passwords
   - Monitor access logs in Supabase

