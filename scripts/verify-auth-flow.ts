#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
 name: string;
 passed: boolean;
 message: string;
}

const results: CheckResult[] = [];

function checkFile(filePath: string, checks: { name: string; pattern: RegExp; shouldExist: boolean }[]): void {
 const fullPath = path.join(process.cwd(), filePath);
 
 if (!fs.existsSync(fullPath)) {
 results.push({
 name: `File exists: ${filePath}`,
 passed: false,
 message: `File not found: ${filePath}`
 });
 return;
 }

 const content = fs.readFileSync(fullPath, 'utf-8');

 checks.forEach(check => {
 const found = check.pattern.test(content);
 const passed = check.shouldExist ? found : !found;
 
 results.push({
 name: check.name,
 passed,
 message: passed 
 ? `✓ ${check.name}` 
 : `✗ ${check.name} - ${check.shouldExist ? 'Pattern not found' : 'Pattern should not exist'}`
 });
 });
}

console.log('🔍 Verifying Authentication Flow Updates...\n');

checkFile('src/app/api/auth/post-signin/route.ts', [
 {
 name: 'Post-signin: No onboarding redirect',
 pattern: /redirect.*onboarding/i,
 shouldExist: false
 },
 {
 name: 'Post-signin: Direct dashboard redirect',
 pattern: /redirect.*dashboard/i,
 shouldExist: true
 },
 {
 name: 'Post-signin: Skip onboarding comment',
 pattern: /skip.*onboarding/i,
 shouldExist: true
 }
]);

checkFile('src/app/api/auth/post-signup/route.ts', [
 {
 name: 'Post-signup: No onboarding redirect',
 pattern: /NextResponse\.redirect.*onboarding|new URL\(['"]\/onboarding/i,
 shouldExist: false
 },
 {
 name: 'Post-signup: Direct dashboard redirect',
 pattern: /redirect.*dashboard/i,
 shouldExist: true
 },
 {
 name: 'Post-signup: Automatic profile creation',
 pattern: /create.*profile|userRepository\.create/i,
 shouldExist: true
 },
 {
 name: 'Post-signup: Skip onboarding comment',
 pattern: /skip.*onboarding/i,
 shouldExist: true
 }
]);

checkFile('src/app/sign-in/[[...sign-in]]/page.tsx', [
 {
 name: 'Sign-in: Role parameter support',
 pattern: /searchParams.*role|role.*searchParams/i,
 shouldExist: true
 },
 {
 name: 'Sign-in: Post-signin redirect URL',
 pattern: /forceRedirectUrl.*post-signin/i,
 shouldExist: true
 },
 {
 name: 'Sign-in: Documentation comment',
 pattern: /direct.*dashboard|no.*onboarding/i,
 shouldExist: true
 }
]);

checkFile('src/app/sign-up/[[...sign-up]]/page.tsx', [
 {
 name: 'Sign-up: Role parameter support',
 pattern: /searchParams.*role|role.*searchParams/i,
 shouldExist: true
 },
 {
 name: 'Sign-up: Post-signup redirect URL with role',
 pattern: /forceRedirectUrl.*post-signup.*role/i,
 shouldExist: true
 },
 {
 name: 'Sign-up: Role in metadata',
 pattern: /unsafeMetadata.*role/i,
 shouldExist: true
 },
 {
 name: 'Sign-up: Documentation comment',
 pattern: /direct.*dashboard|no.*onboarding|automatic/i,
 shouldExist: true
 }
]);

checkFile('src/app/onboarding/page.tsx', [
 {
 name: 'Onboarding: Marked as deprecated/fallback',
 pattern: /DEPRECATED|fallback|emergency/i,
 shouldExist: true
 },
 {
 name: 'Onboarding: Immediate profile check',
 pattern: /checkExistingProfile|check.*profile/i,
 shouldExist: true
 },
 {
 name: 'Onboarding: Redirect to dashboard if profile exists',
 pattern: /redirect.*dashboard|push.*dashboard/i,
 shouldExist: true
 }
]);

checkFile('src/app/dashboard/page.tsx', [
 {
 name: 'Dashboard: Role-based redirect for creators',
 pattern: /creator.*dashboard|hasRole.*creator/i,
 shouldExist: true
 },
 {
 name: 'Dashboard: Auth context usage',
 pattern: /useAuthContext|userProfile/i,
 shouldExist: true
 }
]);

console.log('📋 Verification Results:\n');

const passed = results.filter(r => r.passed).length;
const total = results.length;

results.forEach(result => {
 const icon = result.passed ? '✅' : '❌';
 console.log(`${icon} ${result.message}`);
});

console.log(`\n${'='.repeat(60)}`);
console.log(`Total: ${passed}/${total} checks passed`);
console.log(`${'='.repeat(60)}\n`);

if (passed === total) {
 console.log('✅ All authentication flow checks passed!');
 console.log('\n📝 Summary:');
 console.log(' • Post-signin redirects directly to dashboard');
 console.log(' • Post-signup creates profile and redirects to dashboard');
 console.log(' • Sign-in/sign-up pages support role parameter');
 console.log(' • Onboarding page is marked as fallback only');
 console.log(' • No onboarding redirects in normal flow');
 process.exit(0);
} else {
 console.log('❌ Some checks failed. Please review the implementation.');
 process.exit(1);
}
