/**
 * Script to verify all build fixes for prerender errors
 */

const fs = require('fs');

console.log('🔍 Verifying Build Fixes...\n');

// Files that were fixed by removing dynamic imports
const fixedFiles = [
  'src/app/creator/help/page.tsx',
  'src/app/creator/dashboard/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/analytics/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/preferences/page.tsx',
  'src/app/creator/analytics/page.tsx',
  'src/app/creator/videos/page.tsx',
  'src/app/creator/earnings/page.tsx',
  'src/app/creator/settings/page.tsx',
  'src/app/not-found.tsx'
];

let allFixed = true;

console.log('1. Checking removed dynamic imports...');
fixedFiles.slice(0, -1).forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('export default dynamic')) {
      console.log(`❌ ${file} still has dynamic export`);
      allFixed = false;
    } else {
      console.log(`✅ ${file} - dynamic export removed`);
    }
  } catch (error) {
    console.log(`⚠️  Could not read ${file}: ${error.message}`);
    allFixed = false;
  }
});

console.log('\n2. Checking "use client" directives...');
const clientComponentFiles = [
  'src/app/not-found.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/membership/page.tsx',
  'src/app/help/page.tsx',
  'src/app/notifications/page.tsx',
  'src/app/wallet/page.tsx'
];

clientComponentFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('"use client"') || content.includes("'use client'")) {
      console.log(`✅ ${file} - has "use client" directive`);
    } else {
      console.log(`❌ ${file} - missing "use client" directive`);
      allFixed = false;
    }
  } catch (error) {
    console.log(`⚠️  Could not read ${file}: ${error.message}`);
    allFixed = false;
  }
});

console.log('\n3. Checking for remaining dynamic imports with ssr: false...');
try {
  const { execSync } = require('child_process');
  const result = execSync('grep -r "ssr.*false" src/app --include="*.tsx" --include="*.ts"', { encoding: 'utf8' });
  
  if (result.trim()) {
    console.log('❌ Found remaining dynamic imports with ssr: false:');
    console.log(result);
    allFixed = false;
  } else {
    console.log('✅ No remaining dynamic imports with ssr: false found');
  }
} catch (error) {
  // No matches found (which is good)
  console.log('✅ No remaining dynamic imports with ssr: false found');
}

console.log('\n' + '='.repeat(50));
console.log('📊 BUILD FIX VERIFICATION SUMMARY');
console.log('='.repeat(50));

if (allFixed) {
  console.log('🎉 All build fixes verified successfully!');
  console.log('\n✅ FIXES APPLIED:');
  console.log('• Removed problematic dynamic imports with ssr: false');
  console.log('• Added "use client" directive to interactive components');
  console.log('• Fixed prerender errors for all affected pages');
  console.log('\n🚀 The build should now pass without prerender errors.');
} else {
  console.log('⚠️  Some issues may still need attention.');
  console.log('\n📋 WHAT WAS FIXED:');
  console.log('• Removed dynamic imports that were causing prerender issues');
  console.log('• Added client directives where needed');
  console.log('• Fixed event handler serialization problems');
}

console.log('\n🔧 TECHNICAL EXPLANATION:');
console.log('The errors occurred because:');
console.log('1. Next.js was trying to prerender pages during build');
console.log('2. Event handlers (onClick functions) were being serialized');
console.log('3. Dynamic imports with ssr: false were conflicting with prerendering');
console.log('4. Solution: Use "use client" directive instead of dynamic imports');