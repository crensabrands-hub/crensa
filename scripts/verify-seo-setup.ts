/**
 * SEO Verification Script
 * Run with: npx tsx scripts/verify-seo-setup.ts
 * 
 * This script verifies that all SEO configurations are properly set up.
 */

import fs from 'fs';
import path from 'path';

interface SEOCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

const results: SEOCheckResult[] = [];

console.log('🔍 Starting Crensa SEO Verification...\n');

// Check 1: Metadata file exists
const metadataPath = path.join(process.cwd(), 'src/lib/seo/metadata.ts');
if (fs.existsSync(metadataPath)) {
  results.push({
    name: 'SEO Metadata Config',
    status: 'pass',
    message: 'src/lib/seo/metadata.ts exists',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'SEO Metadata Config',
    status: 'fail',
    message: 'src/lib/seo/metadata.ts NOT found',
    severity: 'critical',
  });
}

// Check 2: Schema file exists
const schemaPath = path.join(process.cwd(), 'src/lib/seo/schema.ts');
if (fs.existsSync(schemaPath)) {
  results.push({
    name: 'JSON-LD Schema Definitions',
    status: 'pass',
    message: 'src/lib/seo/schema.ts exists',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'JSON-LD Schema Definitions',
    status: 'fail',
    message: 'src/lib/seo/schema.ts NOT found',
    severity: 'critical',
  });
}

// Check 3: Schema Renderer component exists
const rendererPath = path.join(process.cwd(), 'src/components/schema/SchemaRenderer.tsx');
if (fs.existsSync(rendererPath)) {
  results.push({
    name: 'Schema Renderer Component',
    status: 'pass',
    message: 'src/components/schema/SchemaRenderer.tsx exists',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'Schema Renderer Component',
    status: 'fail',
    message: 'src/components/schema/SchemaRenderer.tsx NOT found',
    severity: 'critical',
  });
}

// Check 4: Sitemap file exists
const sitemapPath = path.join(process.cwd(), 'src/app/sitemap.ts');
if (fs.existsSync(sitemapPath)) {
  results.push({
    name: 'XML Sitemap',
    status: 'pass',
    message: 'src/app/sitemap.ts exists',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'XML Sitemap',
    status: 'fail',
    message: 'src/app/sitemap.ts NOT found',
    severity: 'critical',
  });
}

// Check 5: Robots file exists
const robotsPath = path.join(process.cwd(), 'src/app/robots.ts');
if (fs.existsSync(robotsPath)) {
  results.push({
    name: 'Robots.txt Configuration',
    status: 'pass',
    message: 'src/app/robots.ts exists',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'Robots.txt Configuration',
    status: 'fail',
    message: 'src/app/robots.ts NOT found',
    severity: 'critical',
  });
}

// Check 6: Layout uses schema
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
if (layoutContent.includes('SchemaRenderer') && layoutContent.includes('getOrganizationSchema')) {
  results.push({
    name: 'Layout Schema Integration',
    status: 'pass',
    message: 'Root layout includes SchemaRenderer',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'Layout Schema Integration',
    status: 'warn',
    message: 'Root layout may not include SchemaRenderer',
    severity: 'warning',
  });
}

// Check 7: About page has metadata
const aboutPath = path.join(process.cwd(), 'src/app/about/page.tsx');
const aboutContent = fs.readFileSync(aboutPath, 'utf-8');
if (aboutContent.includes('createPageMetadata')) {
  results.push({
    name: 'About Page Metadata',
    status: 'pass',
    message: 'About page has SEO metadata',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'About Page Metadata',
    status: 'warn',
    message: 'About page missing SEO metadata',
    severity: 'warning',
  });
}

// Check 8: Verification codes in layout
if (layoutContent.includes('YOUR_GOOGLE_VERIFICATION_CODE')) {
  results.push({
    name: 'Google Verification Code',
    status: 'warn',
    message: 'Google verification code needs to be added',
    severity: 'warning',
  });
} else {
  results.push({
    name: 'Google Verification Code',
    status: 'info',
    message: 'Google verification code appears to be configured',
    severity: 'info',
  });
}

// Check 9: OG images exist
const publicPath = path.join(process.cwd(), 'public');
const ogImagePath = path.join(publicPath, 'og-image.png');
if (fs.existsSync(ogImagePath)) {
  results.push({
    name: 'OG Image (og-image.png)',
    status: 'pass',
    message: 'og-image.png exists in public/',
    severity: 'critical',
  });
} else {
  results.push({
    name: 'OG Image (og-image.png)',
    status: 'warn',
    message: 'og-image.png NOT found in public/ - Create one (1200x630px)',
    severity: 'warning',
  });
}

// Check 10: NEXT_PUBLIC_SITE_URL env
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (envContent.includes('NEXT_PUBLIC_SITE_URL')) {
    results.push({
      name: 'Site URL Environment Variable',
      status: 'pass',
      message: 'NEXT_PUBLIC_SITE_URL is configured',
      severity: 'critical',
    });
  } else {
    results.push({
      name: 'Site URL Environment Variable',
      status: 'warn',
      message: 'NEXT_PUBLIC_SITE_URL not found in .env.local',
      severity: 'warning',
    });
  }
} else {
  results.push({
    name: 'Site URL Environment Variable',
    status: 'warn',
    message: '.env.local not found - Create with NEXT_PUBLIC_SITE_URL variable',
    severity: 'warning',
  });
}

// Print results
console.log('=' .repeat(70));
console.log('SEO VERIFICATION RESULTS');
console.log('=' .repeat(70));

const critical = results.filter((r) => r.severity === 'critical');
const warnings = results.filter((r) => r.severity === 'warning');
const info = results.filter((r) => r.severity === 'info');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

results.forEach((result) => {
  const icon =
    result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${result.name}`);
  console.log(`   ${result.message}`);
  if (result.status === 'pass') passCount++;
  if (result.status === 'fail') failCount++;
  if (result.status === 'warn') warnCount++;
});

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`✅ Passed: ${passCount}`);
console.log(`⚠️  Warnings: ${warnCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log('='.repeat(70));

if (failCount > 0) {
  console.log('\n🔴 CRITICAL ISSUES - Please fix before production');
  const criticalFails = results.filter(
    (r) => r.severity === 'critical' && r.status === 'fail'
  );
  criticalFails.forEach((result) => {
    console.log(`  - ${result.message}`);
  });
}

if (warnCount > 0) {
  console.log('\n🟡 WARNINGS - Recommended to address');
  const criticalWarns = results.filter(
    (r) => r.severity === 'critical' && r.status === 'warn'
  );
  if (criticalWarns.length > 0) {
    console.log('  Critical:');
    criticalWarns.forEach((result) => {
      console.log(`    - ${result.message}`);
    });
  }

  const otherWarns = results.filter(
    (r) => r.severity === 'warning' && r.status === 'warn'
  );
  if (otherWarns.length > 0) {
    console.log('  Other:');
    otherWarns.forEach((result) => {
      console.log(`    - ${result.message}`);
    });
  }
}

console.log('\n📚 For complete SEO implementation details, see: SEO_IMPLEMENTATION.md');
console.log('🚀 Next steps: See "Configuration TODO" in SEO_IMPLEMENTATION.md\n');

process.exit(failCount > 0 ? 1 : 0);
