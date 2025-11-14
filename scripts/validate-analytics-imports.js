#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating Analytics API structure...\n');

const analyticsFile = 'src/app/api/creator/analytics/route.ts';

if (!fs.existsSync(analyticsFile)) {
 console.log('❌ Analytics route file not found');
 process.exit(1);
}

const content = fs.readFileSync(analyticsFile, 'utf8');

const requiredImports = [
 'NextRequest',
 'NextResponse',
 'auth',
 'userRepository',
 'transactionRepository',
 'sql',
 'db',
 'videos',
 'transactions'
];

console.log('📦 Checking imports...');
requiredImports.forEach(importName => {
 if (content.includes(importName)) {
 console.log(` ✅ ${importName}`);
 } else {
 console.log(` ❌ ${importName} - Missing`);
 }
});

const requiredFunctions = [
 'export async function GET',
 'async function getCreatorAnalytics'
];

console.log('\n🔧 Checking functions...');
requiredFunctions.forEach(func => {
 if (content.includes(func)) {
 console.log(` ✅ ${func}`);
 } else {
 console.log(` ❌ ${func} - Missing`);
 }
});

const errorHandling = [
 'try {',
 'catch (error)',
 'NextResponse.json'
];

console.log('\n🛡️ Checking error handling...');
errorHandling.forEach(pattern => {
 if (content.includes(pattern)) {
 console.log(` ✅ ${pattern}`);
 } else {
 console.log(` ❌ ${pattern} - Missing`);
 }
});

const videoLogic = [
 'videoId',
 'if (videoId)',
 'eq(transactions.videoId, videoId)'
];

console.log('\n🎥 Checking video-specific logic...');
videoLogic.forEach(pattern => {
 if (content.includes(pattern)) {
 console.log(` ✅ ${pattern}`);
 } else {
 console.log(` ❌ ${pattern} - Missing`);
 }
});

console.log('\n✅ Analytics API validation completed!');

const stats = fs.statSync(analyticsFile);
console.log(`\n📊 File size: ${stats.size} bytes`);
console.log(`📊 Lines: ${content.split('\n').length}`);

const potentialIssues = [];

if (content.includes('require(')) {
 potentialIssues.push('Uses CommonJS require() instead of ES imports');
}

if (!content.includes('export async function GET')) {
 potentialIssues.push('Missing GET export function');
}

if (!content.includes('videoId')) {
 potentialIssues.push('Missing video-specific analytics support');
}

if (potentialIssues.length > 0) {
 console.log('\n⚠️ Potential issues found:');
 potentialIssues.forEach(issue => {
 console.log(` - ${issue}`);
 });
} else {
 console.log('\n🎉 No obvious issues found!');
}