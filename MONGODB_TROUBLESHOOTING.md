# MongoDB Connection Troubleshooting Guide

If you're getting a `MongoServerSelectionError` or connection timeout, follow these steps:

## Common Error Messages

- `Server selection timed out after 5000 ms`
- `MongoServerSelectionError`
- `ReplicaSetNoPrimary`

## Step-by-Step Fix

### Step 1: Whitelist Your IP Address in MongoDB Atlas

**This is the most common cause of connection issues.**

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Log in to your account
3. Select your cluster
4. Click **"Network Access"** in the left sidebar
5. Click **"Add IP Address"** button
6. Choose one of these options:
   - **"Add Current IP Address"** - Adds your current IP (recommended for development)
   - **"Allow Access from Anywhere"** - Adds `0.0.0.0/0` (⚠️ Less secure, but works everywhere)
7. Click **"Confirm"**
8. Wait 1-2 minutes for the change to take effect

**Important:** If your IP changes (e.g., you're on a different network), you'll need to add the new IP address.

### Step 2: Verify Your Connection String

Your `.env` file should have a connection string like this:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Check:**
- ✅ Username is correct (not email)
- ✅ Password is URL-encoded (special characters like `@`, `#`, `%` need encoding)
- ✅ Cluster name matches your Atlas cluster
- ✅ Connection string includes `?retryWrites=true&w=majority`

**To get your connection string:**
1. Go to MongoDB Atlas Dashboard
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose **"Node.js"** and version **"4.1 or later"**
5. Copy the connection string
6. Replace `<password>` with your actual database user password
7. Replace `<dbname>` with your database name (or remove it to use default)

### Step 3: Check Your MongoDB Atlas Cluster Status

1. Go to MongoDB Atlas Dashboard
2. Check if your cluster shows **"Paused"** or **"Stopped"**
3. If paused, click **"Resume"** to start it
4. Wait a few minutes for the cluster to start

**Note:** Free tier clusters pause after 1 week of inactivity. You'll need to resume them.

### Step 4: Verify Database User Credentials

1. Go to MongoDB Atlas Dashboard
2. Click **"Database Access"** in the left sidebar
3. Find your database user
4. Verify:
   - Username is correct
   - Password is correct (you can reset it if needed)
   - User has proper permissions (should have "Atlas admin" or "readWrite" role)

**To reset password:**
1. Click on the user
2. Click **"Edit"**
3. Click **"Edit Password"**
4. Enter new password
5. Update your `.env` file with the new password

### Step 5: Check Connection String Format

**Correct format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ Using email instead of username
- ❌ Not URL-encoding special characters in password
- ❌ Missing `mongodb+srv://` prefix
- ❌ Wrong cluster URL
- ❌ Missing query parameters

**Password encoding:**
If your password contains special characters, encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Or use an online URL encoder: https://www.urlencoder.org/

### Step 6: Test Network Connectivity

Try pinging your MongoDB cluster:

```bash
# Replace with your actual cluster hostname
ping cluster0.xxxxx.mongodb.net
```

If ping fails, there might be a network/firewall issue.

### Step 7: Check Firewall/Antivirus

Some firewalls or antivirus software block MongoDB connections:

1. Temporarily disable firewall/antivirus
2. Try connecting again
3. If it works, add MongoDB to your firewall exceptions

### Step 8: Verify Environment Variables

Make sure your `.env` file:
1. ✅ Exists in the root directory (same level as `package.json`)
2. ✅ Is named exactly `.env` (not `.env.txt` or `env`)
3. ✅ Contains `MONGODB_URI=your_connection_string`
4. ✅ Has no extra spaces or quotes around the value
5. ✅ Server was restarted after adding/changing `.env`

**Check your .env file:**
```bash
# In your project root
cat .env | grep MONGODB_URI
```

### Step 9: Test Connection String Directly

You can test your connection string using MongoDB Compass or the MongoDB shell:

**Using MongoDB Compass:**
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Paste your connection string
3. Click "Connect"
4. If it fails, you'll see a more detailed error message

### Step 10: Check Server Logs

After making changes, restart your server and check the logs:

```bash
npm start
```

Look for:
- ✅ `Connected to MongoDB Atlas successfully` - Success!
- ❌ Any error messages - Check the specific error

## Quick Checklist

Before trying again, verify:

- [ ] IP address is whitelisted in MongoDB Atlas Network Access
- [ ] Connection string is correct in `.env` file
- [ ] MongoDB cluster is running (not paused)
- [ ] Database user credentials are correct
- [ ] Password is URL-encoded if it has special characters
- [ ] `.env` file exists and is properly formatted
- [ ] Server was restarted after changing `.env`
- [ ] No firewall/antivirus blocking the connection

## Still Having Issues?

1. **Check MongoDB Atlas Status Page**: https://status.mongodb.com/
2. **Check MongoDB Atlas Logs**: Dashboard → Monitoring → Logs
3. **Try connecting from a different network** (to rule out network issues)
4. **Contact MongoDB Atlas Support** if the issue persists

## Example Working Connection String

```env
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/hcm_church?retryWrites=true&w=majority
```

**Note:** Replace:
- `myuser` with your MongoDB username
- `mypassword123` with your MongoDB password (URL-encoded if needed)
- `cluster0.abc123.mongodb.net` with your actual cluster URL
- `hcm_church` with your database name (optional)

