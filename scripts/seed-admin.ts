/**
 * Admin Seeder Script
 * 
 * IMPORTANT: Before running this script, you need to:
 * 1. Create a Clerk user account with the email specified below
 * 2. In Clerk Dashboard, go to Users > [User] > Metadata > Public Metadata
 * 3. Add: { "role": "admin" }
 * 4. Copy the Clerk User ID (starts with 'user_') and paste it below
 * 
 * Then run: npx tsx scripts/seed-admin.ts
 */

import { db } from '../src/lib/database/connection';
import { users } from '../src/lib/database/schema';
import { eq } from 'drizzle-orm';

// ==========================================
// CONFIGURE THESE VALUES BEFORE RUNNING
// ==========================================

const ADMIN_CONFIG = {
  // The Clerk User ID from your Clerk dashboard (looks like 'user_2x...')
  clerkId: 'YOUR_CLERK_USER_ID_HERE',
  
  // The email used to create the Clerk account
  email: 'YOUR_ADMIN_EMAIL_HERE',
  
  // Username for the admin (must be unique in the database)
  username: 'admin',
  
  // Optional: Avatar URL (can be left as null)
  avatar: null as string | null,
};

// ==========================================

async function seedAdmin() {
  console.log('\n🔐 Admin Seeder Script');
  console.log('='.repeat(50));

  // Validation
  if (ADMIN_CONFIG.clerkId === 'YOUR_CLERK_USER_ID_HERE') {
    console.error('\n❌ Error: Please set the ADMIN_CONFIG.clerkId value!');
    console.log('\nSteps to get the Clerk User ID:');
    console.log('1. Go to your Clerk Dashboard (https://dashboard.clerk.com)');
    console.log('2. Navigate to Users');
    console.log('3. Find or create the admin user');
    console.log('4. Copy the User ID (starts with "user_")');
    console.log('5. Update this script with the ID');
    process.exit(1);
  }

  if (ADMIN_CONFIG.email === 'YOUR_ADMIN_EMAIL_HERE') {
    console.error('\n❌ Error: Please set the ADMIN_CONFIG.email value!');
    process.exit(1);
  }

  console.log(`\n📧 Email: ${ADMIN_CONFIG.email}`);
  console.log(`👤 Username: ${ADMIN_CONFIG.username}`);
  console.log(`🔑 Clerk ID: ${ADMIN_CONFIG.clerkId}`);

  try {
    // Check if user already exists by email or clerkId
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_CONFIG.email))
      .limit(1);

    if (existingUserByEmail.length > 0) {
      const existingUser = existingUserByEmail[0];
      
      if (existingUser.role === 'admin') {
        console.log('\n✅ Admin user already exists with this email!');
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`   Role: ${existingUser.role}`);
        process.exit(0);
      } else {
        // Update existing user to admin
        console.log(`\n🔄 User exists with role "${existingUser.role}". Updating to admin...`);
        
        await db
          .update(users)
          .set({ 
            role: 'admin',
            clerkId: ADMIN_CONFIG.clerkId, // Update clerkId if needed
            updatedAt: new Date()
          })
          .where(eq(users.email, ADMIN_CONFIG.email));
        
        console.log('✅ User updated to admin role!');
        process.exit(0);
      }
    }

    // Check if clerkId already exists
    const existingUserByClerkId = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, ADMIN_CONFIG.clerkId))
      .limit(1);

    if (existingUserByClerkId.length > 0) {
      const existingUser = existingUserByClerkId[0];
      console.log(`\n⚠️  A user with this Clerk ID already exists:`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      
      if (existingUser.role !== 'admin') {
        console.log('\n🔄 Updating user to admin role...');
        await db
          .update(users)
          .set({ 
            role: 'admin',
            updatedAt: new Date()
          })
          .where(eq(users.clerkId, ADMIN_CONFIG.clerkId));
        console.log('✅ User updated to admin role!');
      }
      process.exit(0);
    }

    // Check if username already exists
    const existingUserByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, ADMIN_CONFIG.username))
      .limit(1);

    if (existingUserByUsername.length > 0) {
      console.error(`\n❌ Error: Username "${ADMIN_CONFIG.username}" already exists.`);
      console.log('   Please choose a different username.');
      process.exit(1);
    }

    // Create new admin user
    console.log('\n📝 Creating new admin user...');
    
    const [newAdmin] = await db
      .insert(users)
      .values({
        clerkId: ADMIN_CONFIG.clerkId,
        email: ADMIN_CONFIG.email,
        username: ADMIN_CONFIG.username,
        role: 'admin',
        avatar: ADMIN_CONFIG.avatar,
        isActive: true,
        isSuspended: false,
        coinBalance: 0,
        totalCoinsPurchased: 0,
        totalCoinsSpent: 0,
      })
      .returning();

    console.log('\n✅ Admin user created successfully!');
    console.log('='.repeat(50));
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Username: ${newAdmin.username}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Clerk ID: ${newAdmin.clerkId}`);
    console.log('='.repeat(50));
    
    console.log('\n📋 IMPORTANT REMINDERS:');
    console.log('─'.repeat(50));
    console.log('1. Make sure the Clerk user has publicMetadata: { "role": "admin" }');
    console.log('2. The admin can now access: /admin');
    console.log('3. Sign in with the email/password you set up in Clerk');
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('\n❌ Error seeding admin user:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the seeder
seedAdmin();
