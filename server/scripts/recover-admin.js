/**
 * Admin Recovery Script
 * 
 * This script helps you recover admin access by:
 * 1. Listing all users in Supabase
 * 2. Resetting a user's password
 * 3. Assigning admin role to a user
 * 
 * Usage:
 * node server/scripts/recover-admin.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.log('\nPlease add to your .env file:');
  console.log('  SUPABASE_URL=your_supabase_project_url');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.log('\nTo find your Service Role Key:');
  console.log('  1. Go to Supabase Dashboard > Settings > API');
  console.log('  2. Copy the "service_role" key (keep it secret!)');
  process.exit(1);
}

// Create admin client with service role key (has elevated permissions)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function listAllUsers() {
  try {
    console.log('\n📋 Fetching all users from Supabase...\n');
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    if (users.users.length === 0) {
      console.log('   No users found in Supabase.');
      return [];
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('   All Users in Supabase');
    console.log('═══════════════════════════════════════════════════════\n');
    
    users.users.forEach((user, index) => {
      const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
      const adminBadge = isAdmin ? ' [ADMIN]' : '';
      console.log(`${index + 1}. ${user.email}${adminBadge}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
      console.log('');
    });

    return users.users;
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    return [];
  }
}

async function resetPassword(userEmail) {
  try {
    console.log(`\n🔍 Looking up user: ${userEmail}`);
    
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const user = users.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error(`❌ User with email "${userEmail}" not found.`);
      return false;
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // Generate a new password
    const newPassword = await question('\nEnter a new password (min 6 characters): ');
    
    if (!newPassword || newPassword.length < 6) {
      console.error('❌ Password must be at least 6 characters long');
      return false;
    }

    // Update user password
    console.log('\n🔧 Resetting password...');
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword
      }
    );

    if (updateError) {
      throw new Error(`Failed to reset password: ${updateError.message}`);
    }

    console.log('✅ Password reset successfully!');
    console.log(`\n📧 Login credentials:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log(`\n🔗 Login at: http://localhost:3000/admin/login.html`);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function makeAdmin(userEmail) {
  try {
    console.log(`\n🔍 Looking up user: ${userEmail}`);
    
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const user = users.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error(`❌ User with email "${userEmail}" not found.`);
      return false;
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`   Current app_metadata:`, user.app_metadata || '{}');
    console.log(`   Current user_metadata:`, user.user_metadata || '{}');

    // Update app_metadata (more secure - only admins can modify)
    console.log('\n🔧 Assigning admin role...');
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata,
          role: 'admin'
        },
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'  // Also set in user_metadata for backward compatibility
        }
      }
    );

    if (updateError) {
      throw new Error(`Failed to update user: ${updateError.message}`);
    }

    console.log('✅ Successfully assigned admin role!');
    console.log(`   New app_metadata:`, updatedUser.user.app_metadata);
    console.log(`   New user_metadata:`, updatedUser.user.user_metadata);
    console.log('\n🎉 User is now an admin!');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function createNewAdmin() {
  try {
    console.log('\n📝 Creating a new admin user...\n');
    
    const email = await question('Enter email address: ');
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address');
      return false;
    }

    const password = await question('Enter password (min 6 characters): ');
    if (!password || password.length < 6) {
      console.error('❌ Password must be at least 6 characters long');
      return false;
    }

    console.log('\n🔧 Creating user...');
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      app_metadata: {
        role: 'admin'
      },
      user_metadata: {
        role: 'admin'
      }
    });

    if (createError) {
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    console.log('✅ User created successfully!');
    console.log(`\n📧 Login credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`\n🔗 Login at: http://localhost:3000/admin/login.html`);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('   Admin Recovery Tool');
  console.log('═══════════════════════════════════════');

  // First, list all users
  const users = await listAllUsers();

  console.log('\n═══════════════════════════════════════');
  console.log('   What would you like to do?');
  console.log('═══════════════════════════════════════');
  console.log('1. List all users (already shown above)');
  console.log('2. Reset password for an existing user');
  console.log('3. Make an existing user an admin');
  console.log('4. Create a new admin user');
  console.log('5. Exit');
  console.log('═══════════════════════════════════════\n');

  const choice = await question('Enter your choice (1-5): ');

  switch (choice.trim()) {
    case '1':
      await listAllUsers();
      break;
    
    case '2':
      const emailForReset = await question('\nEnter the email address to reset password: ');
      await resetPassword(emailForReset.trim());
      break;
    
    case '3':
      const emailForAdmin = await question('\nEnter the email address to make admin: ');
      await makeAdmin(emailForAdmin.trim());
      break;
    
    case '4':
      await createNewAdmin();
      break;
    
    case '5':
      console.log('\n👋 Goodbye!');
      break;
    
    default:
      console.log('\n❌ Invalid choice. Please run the script again.');
  }

  rl.close();
}

main();

