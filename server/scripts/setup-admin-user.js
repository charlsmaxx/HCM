/**
 * Helper script to set up an admin user in Supabase
 * 
 * Usage:
 * 1. Add SUPABASE_SERVICE_ROLE_KEY to your .env file
 * 2. Run: node server/scripts/setup-admin-user.js <user_email>
 * 
 * Or run interactively:
 * node server/scripts/setup-admin-user.js
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

async function setupAdminUser(userEmail) {
  try {
    console.log('\n🔍 Looking up user:', userEmail);
    
    // Get user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const user = users.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error(`❌ User with email "${userEmail}" not found.`);
      console.log('\nAvailable users:');
      users.users.forEach(u => {
        console.log(`  - ${u.email} (ID: ${u.id})`);
      });
      return false;
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`   Current app_metadata:`, user.app_metadata || '{}');
    console.log(`   Current user_metadata:`, user.user_metadata || '{}');

    // Update app_metadata (more secure - only admins can modify)
    console.log('\n🔧 Updating user metadata...');
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

    console.log('✅ Successfully updated user!');
    console.log(`   New app_metadata:`, updatedUser.user.app_metadata);
    console.log(`   New user_metadata:`, updatedUser.user.user_metadata);
    console.log('\n🎉 User is now an admin!');
    console.log('\nYou can now log in at: http://localhost:3000/admin/login.html');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('   Supabase Admin User Setup');
  console.log('═══════════════════════════════════════');

  let userEmail = process.argv[2];

  if (!userEmail) {
    userEmail = await question('\nEnter the email address of the user to make admin: ');
  }

  if (!userEmail || !userEmail.includes('@')) {
    console.error('❌ Invalid email address');
    rl.close();
    process.exit(1);
  }

  const success = await setupAdminUser(userEmail.trim());
  
  rl.close();
  process.exit(success ? 0 : 1);
}

main();


