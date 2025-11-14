

import { readFileSync } from 'fs';
import { join } from 'path';

const apiDir = join(process.cwd(), 'src/app/api/landing');

interface APICheck {
 endpoint: string;
 file: string;
 required: string[];
}

const checks: APICheck[] = [
 {
 endpoint: 'GET /api/landing/featured-series',
 file: 'featured-series/route.ts',
 required: ['GET', 'FeaturedSeries', 'main', 'side'],
 },
 {
 endpoint: 'GET /api/landing/trending-videos',
 file: 'trending-videos/route.ts',
 required: ['GET', 'TrendingVideo', 'limit'],
 },
 {
 endpoint: 'GET /api/landing/trending-creators',
 file: 'trending-creators/route.ts',
 required: ['GET', 'limit'],
 },
 {
 endpoint: 'GET /api/landing/unified-content',
 file: 'unified-content/route.ts',
 required: ['GET', 'UnifiedContent', 'category'],
 },
];

console.log('🔍 Verifying Landing Page API Endpoints...\n');

let allPassed = true;

for (const check of checks) {
 const filePath = join(apiDir, check.file);
 
 try {
 const content = readFileSync(filePath, 'utf-8');
 
 console.log(`✓ ${check.endpoint}`);
 console.log(` File: ${check.file}`);

 const missing: string[] = [];
 for (const required of check.required) {
 if (!content.includes(required)) {
 missing.push(required);
 }
 }
 
 if (missing.length > 0) {
 console.log(` ⚠️ Missing elements: ${missing.join(', ')}`);
 allPassed = false;
 } else {
 console.log(` ✓ All required elements present`);
 }

 if (!content.includes('try') || !content.includes('catch')) {
 console.log(` ⚠️ Missing error handling`);
 allPassed = false;
 } else {
 console.log(` ✓ Error handling present`);
 }

 if (!content.includes('CacheService') && !check.endpoint.includes('trending-creators')) {
 console.log(` ⚠️ Missing cache implementation`);
 allPassed = false;
 } else {
 console.log(` ✓ Caching implemented`);
 }
 
 console.log('');
 
 } catch (error) {
 console.log(`✗ ${check.endpoint}`);
 console.log(` File: ${check.file}`);
 console.log(` ❌ File not found or cannot be read`);
 console.log('');
 allPassed = false;
 }
}

if (allPassed) {
 console.log('✅ All API endpoints verified successfully!');
 process.exit(0);
} else {
 console.log('❌ Some checks failed. Please review the output above.');
 process.exit(1);
}
