#!/usr/bin/env tsx

import { testDatabaseConnection } from '../src/lib/database/connection';
import { userRepository } from '../src/lib/database/repositories';

async function testDatabase() {
 console.log('🔍 Testing database connection...');
 
 try {

 const connectionTest = await testDatabaseConnection();
 console.log('✅ Connection test:', connectionTest ? 'SUCCESS' : 'FAILED');
 
 if (!connectionTest) {
 console.log('❌ Database connection failed. Check your DATABASE_URL in .env.local');
 process.exit(1);
 }

 console.log('🔍 Testing user repository...');
 const users = await userRepository.findAll();
 console.log(`✅ Found ${users.length} users in database`);
 
 if (users.length > 0) {
 console.log('📋 Existing users:');
 users.forEach(user => {
 console.log(` - ${user.username} (${user.role}) - Clerk ID: ${user.clerkId}`);
 });
 }
 
 console.log('✅ Database test completed successfully!');
 
 } catch (error) {
 console.error('❌ Database test failed:', error);
 process.exit(1);
 }
 
 process.exit(0);
}

testDatabase();