#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
 name: string;
 passed: boolean;
 message: string;
}

const results: CheckResult[] = [];

function checkFile(filePath: string, description: string): boolean {
 const fullPath = path.join(process.cwd(), filePath);
 const exists = fs.existsSync(fullPath);
 
 results.push({
 name: description,
 passed: exists,
 message: exists ? `✓ ${filePath} exists` : `✗ ${filePath} not found`
 });
 
 return exists;
}

function checkFileContains(filePath: string, searchString: string, description: string): boolean {
 const fullPath = path.join(process.cwd(), filePath);
 
 if (!fs.existsSync(fullPath)) {
 results.push({
 name: description,
 passed: false,
 message: `✗ ${filePath} not found`
 });
 return false;
 }
 
 const content = fs.readFileSync(fullPath, 'utf-8');
 const contains = content.includes(searchString);
 
 results.push({
 name: description,
 passed: contains,
 message: contains 
 ? `✓ ${filePath} contains "${searchString.substring(0, 50)}..."` 
 : `✗ ${filePath} missing "${searchString.substring(0, 50)}..."`
 });
 
 return contains;
}

function printResults() {
 console.log('\n' + '='.repeat(80));
 console.log('ONBOARDING SIMPLIFICATION VERIFICATION RESULTS');
 console.log('='.repeat(80) + '\n');
 
 const passed = results.filter(r => r.passed).length;
 const total = results.length;
 
 results.forEach(result => {
 console.log(result.message);
 });
 
 console.log('\n' + '='.repeat(80));
 console.log(`SUMMARY: ${passed}/${total} checks passed`);
 console.log('='.repeat(80) + '\n');
 
 if (passed === total) {
 console.log('✅ All checks passed! Onboarding simplification is properly implemented.\n');
 process.exit(0);
 } else {
 console.log('❌ Some checks failed. Please review the implementation.\n');
 process.exit(1);
 }
}

console.log('Starting verification...\n');

checkFileContains(
 'src/app/sign-up/[[...sign-up]]/page.tsx',
 'searchParams: { role?: string }',
 'Sign-up page accepts role parameter'
);

checkFileContains(
 'src/app/sign-up/[[...sign-up]]/page.tsx',
 'forceRedirectUrl={`/api/auth/post-signup?role=${role}`}',
 'Sign-up redirects to post-signup handler'
);

checkFileContains(
 'src/app/sign-in/[[...sign-in]]/page.tsx',
 'forceRedirectUrl="/api/auth/post-signin"',
 'Sign-in redirects to post-signin handler'
);

checkFile(
 'src/app/api/auth/post-signup/route.ts',
 'Post-signup handler exists'
);

checkFileContains(
 'src/app/api/auth/post-signup/route.ts',
 'await userRepository.create',
 'Post-signup handler creates user profile'
);

checkFileContains(
 'src/app/api/auth/post-signup/route.ts',
 'role === \'creator\' ? \'/creator/dashboard\' : \'/dashboard\'',
 'Post-signup handler redirects based on role'
);

checkFile(
 'src/app/api/auth/post-signin/route.ts',
 'Post-signin handler exists'
);

checkFileContains(
 'src/app/api/auth/post-signin/route.ts',
 'user.role === \'creator\'',
 'Post-signin handler checks user role'
);

checkFileContains(
 'src/config/environment.ts',
 'creatorSignupUrl: \'/sign-up?role=creator\'',
 'Environment config has creator signup URL'
);

checkFileContains(
 'src/config/environment.ts',
 'memberSignupUrl: \'/sign-up?role=member\'',
 'Environment config has member signup URL'
);

checkFileContains(
 'src/config/environment.ts',
 'creatorSigninUrl',
 'Environment config has creator signin URL'
);

checkFileContains(
 'src/config/environment.ts',
 'memberSigninUrl',
 'Environment config has member signin URL'
);

checkFileContains(
 'src/lib/content-config.ts',
 'creatorSignup: environmentConfig.creatorSignupUrl',
 'Content config exposes creator signup URL'
);

checkFileContains(
 'src/lib/content-config.ts',
 'memberSignup: environmentConfig.memberSignupUrl',
 'Content config exposes member signup URL'
);

checkFileContains(
 'src/app/onboarding/page.tsx',
 'kept as fallback',
 'Onboarding page documented as fallback'
);

checkFileContains(
 'src/app/onboarding/page.tsx',
 'router.push(\'/sign-up\')',
 'Onboarding redirects unauthenticated users to sign-up'
);

checkFileContains(
 'src/components/landing/FeaturedHeroSection.tsx',
 '/sign-up?role=creator',
 'Landing page has creator signup link'
);

printResults();
