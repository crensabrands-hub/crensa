import { db } from '../src/lib/database/connection';
import { users } from '../src/lib/database/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ✏️ Fill these in before running
const ADMIN_CLERK_ID = 'user_37so6Rx7jzMHRAPXc0j9nYI8SGO';
const ADMIN_EMAIL    = 'shreyaskesari805@gmail.com';
const ADMIN_USERNAME = 'admin';
async function seedAdmin() {
  console.log('Checking for existing user...');

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ADMIN_CLERK_ID))
    .limit(1);

  if (existing.length > 0) {
    // User exists — just update their role to admin
    await db
      .update(users)
      .set({ role: 'admin', updatedAt: new Date() })
      .where(eq(users.clerkId, ADMIN_CLERK_ID));

    console.log(`✅ Updated existing user "${existing[0].username}" to admin role.`);
    return;
  }

  // User doesn't exist — insert fresh admin record
  await db.insert(users).values({
    clerkId: ADMIN_CLERK_ID,
    email: ADMIN_EMAIL,
    username: ADMIN_USERNAME,
    role: 'admin',
    isActive: true,
    isSuspended: false,
    coinBalance: 0,
    totalCoinsPurchased: 0,
    totalCoinsSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✅ Admin user "${ADMIN_USERNAME}" created successfully.`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  });
