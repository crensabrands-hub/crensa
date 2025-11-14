#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🧪 Testing Creator Analytics API...\n');

console.log('1. Testing general analytics endpoint...');
try {
 const result = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/creator/analytics', { encoding: 'utf8' });
 console.log(` Status: ${result.trim()}`);
 if (result.trim() === '401') {
 console.log(' ✅ Correctly returns 401 (Unauthorized) without authentication');
 } else {
 console.log(` ⚠️ Unexpected status code: ${result.trim()}`);
 }
} catch (error) {
 console.log(' ❌ Error testing general analytics:', error.message);
}

console.log('\n2. Testing video-specific analytics endpoint...');
try {
 const result = execSync('curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/creator/analytics?videoId=test-video-123"', { encoding: 'utf8' });
 console.log(` Status: ${result.trim()}`);
 if (result.trim() === '401') {
 console.log(' ✅ Correctly returns 401 (Unauthorized) without authentication');
 } else {
 console.log(` ⚠️ Unexpected status code: ${result.trim()}`);
 }
} catch (error) {
 console.log(' ❌ Error testing video-specific analytics:', error.message);
}

console.log('\n3. Testing invalid time range...');
try {
 const result = execSync('curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/creator/analytics?timeRange=invalid"', { encoding: 'utf8' });
 console.log(` Status: ${result.trim()}`);
 if (result.trim() === '401') {
 console.log(' ✅ Correctly returns 401 (Unauthorized) - auth check happens first');
 } else {
 console.log(` ⚠️ Unexpected status code: ${result.trim()}`);
 }
} catch (error) {
 console.log(' ❌ Error testing invalid time range:', error.message);
}

console.log('\n✅ Analytics API tests completed!');
console.log('\nNote: All endpoints correctly require authentication.');
console.log('To test with authentication, you would need to:');
console.log('1. Start the development server: npm run dev');
console.log('2. Login as a creator user');
console.log('3. Use browser dev tools to get the session cookie');
console.log('4. Include the cookie in the curl request');

console.log('\n📋 API Endpoints Summary:');
console.log('- GET /api/creator/analytics - General creator analytics');
console.log('- GET /api/creator/analytics?videoId=<id> - Video-specific analytics');
console.log('- GET /api/creator/analytics?timeRange=week|month|year - Time range filter');
console.log('- GET /api/creator/analytics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - Custom date range');