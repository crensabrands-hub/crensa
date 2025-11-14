

import { readFileSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
 passed: boolean;
 message: string;
 details?: string;
}

function verifyFile(filePath: string, checks: Array<{ name: string; pattern: RegExp | string; shouldExist: boolean }>): VerificationResult[] {
 const results: VerificationResult[] = [];
 
 try {
 const content = readFileSync(join(process.cwd(), filePath), 'utf-8');
 
 for (const check of checks) {
 const pattern = typeof check.pattern === 'string' ? check.pattern : check.pattern.source;
 const regex = typeof check.pattern === 'string' ? new RegExp(check.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) : check.pattern;
 const exists = regex.test(content);
 
 if (exists === check.shouldExist) {
 results.push({
 passed: true,
 message: `✓ ${check.name}`,
 details: check.shouldExist ? 'Found as expected' : 'Not found as expected'
 });
 } else {
 results.push({
 passed: false,
 message: `✗ ${check.name}`,
 details: check.shouldExist ? 'Expected to find but not found' : 'Found but should not exist'
 });
 }
 }
 } catch (error) {
 results.push({
 passed: false,
 message: `✗ Failed to read file: ${filePath}`,
 details: error instanceof Error ? error.message : String(error)
 });
 }
 
 return results;
}

async function verifyBrowsePageUpdates() {
 console.log('🔍 Verifying Browse Page Updates...\n');
 
 const allResults: VerificationResult[] = [];

 console.log('📋 Task 11.1: Include series in content grid');
 const task11_1Results = verifyFile('src/app/api/landing/unified-content/route.ts', [
 {
 name: 'API queries both videos and series',
 pattern: /const videosList = await db/,
 shouldExist: true
 },
 {
 name: 'API queries series data',
 pattern: /const seriesList = await db/,
 shouldExist: true
 },
 {
 name: 'API merges and sorts content',
 pattern: /allContent\.sort/,
 shouldExist: true
 },
 {
 name: 'API includes type field in response',
 pattern: /type: "series"/,
 shouldExist: true
 }
 ]);
 allResults.push(...task11_1Results);
 
 const task11_1CardResults = verifyFile('src/components/landing/UnifiedContentCard.tsx', [
 {
 name: 'Card displays "Series" badge',
 pattern: /Series/,
 shouldExist: true
 },
 {
 name: 'Card has type prop',
 pattern: /type: "series" \| "video"/,
 shouldExist: true
 }
 ]);
 allResults.push(...task11_1CardResults);
 
 task11_1Results.forEach(r => console.log(` ${r.message}`));
 task11_1CardResults.forEach(r => console.log(` ${r.message}`));
 console.log();

 console.log('📋 Task 11.2: Update category filter to show series count');
 const task11_2Results = verifyFile('src/components/landing/CategoryFilterBar.tsx', [
 {
 name: 'Category interface includes videoCount',
 pattern: /videoCount\?:\s*number/,
 shouldExist: true
 },
 {
 name: 'Category interface includes seriesCount',
 pattern: /seriesCount\?:\s*number/,
 shouldExist: true
 },
 {
 name: 'Displays video and series counts',
 pattern: /\{category\.videoCount\}V \+ \{category\.seriesCount\}S/,
 shouldExist: true
 }
 ]);
 allResults.push(...task11_2Results);
 task11_2Results.forEach(r => console.log(` ${r.message}`));
 console.log();

 console.log('📋 Task 11.3: Add series/video toggle filter');
 const task11_3Results = verifyFile('src/components/landing/BrowsePage.tsx', [
 {
 name: 'Has contentTypeFilter state',
 pattern: /contentTypeFilter.*useState.*"all" \| "series" \| "video"/,
 shouldExist: true
 },
 {
 name: 'Has handleContentTypeChange function',
 pattern: /handleContentTypeChange/,
 shouldExist: true
 },
 {
 name: 'Filters content based on type',
 pattern: /filteredContent.*content\.filter/,
 shouldExist: true
 },
 {
 name: 'Has "All Content" button',
 pattern: /All Content/,
 shouldExist: true
 },
 {
 name: 'Has "Series Only" button',
 pattern: /Series Only/,
 shouldExist: true
 },
 {
 name: 'Has "Videos Only" button',
 pattern: /Videos Only/,
 shouldExist: true
 },
 {
 name: 'Uses filteredContent in rendering',
 pattern: /filteredContent\.map/,
 shouldExist: true
 }
 ]);
 allResults.push(...task11_3Results);
 task11_3Results.forEach(r => console.log(` ${r.message}`));
 console.log();

 const passed = allResults.filter(r => r.passed).length;
 const total = allResults.length;
 const failed = total - passed;
 
 console.log('═══════════════════════════════════════════════════════');
 console.log(`📊 Verification Summary: ${passed}/${total} checks passed`);
 
 if (failed > 0) {
 console.log(`\n❌ ${failed} check(s) failed:`);
 allResults.filter(r => !r.passed).forEach(r => {
 console.log(` ${r.message}`);
 if (r.details) console.log(` ${r.details}`);
 });
 } else {
 console.log('\n✅ All checks passed! Browse page updates are complete.');
 }
 
 console.log('═══════════════════════════════════════════════════════');
 
 return failed === 0;
}

verifyBrowsePageUpdates()
 .then(success => {
 process.exit(success ? 0 : 1);
 })
 .catch(error => {
 console.error('❌ Verification failed with error:', error);
 process.exit(1);
 });
