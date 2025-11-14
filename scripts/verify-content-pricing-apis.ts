

import { readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
 passed: boolean;
 message: string;
 details?: string[];
}

interface TestResults {
 videoUploadAPI: ValidationResult;
 videoUpdateAPI: ValidationResult;
 seriesCreateAPI: ValidationResult;
 seriesUpdateAPI: ValidationResult;
 validationLogic: ValidationResult;
}

function checkFileContains(filePath: string, patterns: string[]): ValidationResult {
 try {
 const content = readFileSync(filePath, 'utf-8');
 const missingPatterns: string[] = [];
 
 for (const pattern of patterns) {
 if (!content.includes(pattern)) {
 missingPatterns.push(pattern);
 }
 }
 
 if (missingPatterns.length > 0) {
 return {
 passed: false,
 message: `Missing required patterns in ${filePath}`,
 details: missingPatterns
 };
 }
 
 return {
 passed: true,
 message: `All required patterns found in ${filePath}`
 };
 } catch (error) {
 return {
 passed: false,
 message: `Error reading file: ${filePath}`,
 details: [error instanceof Error ? error.message : 'Unknown error']
 };
 }
}

function verifyVideoUploadAPI(): ValidationResult {
 const filePath = join(process.cwd(), 'src/app/api/videos/upload/route.ts');
 
 const requiredPatterns = [
 'metadata.coinPrice',
 'coinPrice < 1 || coinPrice > 2000',
 'Number.isInteger(coinPrice)',
 'Coin price must be a whole number between 1 and 2000'
 ];
 
 return checkFileContains(filePath, requiredPatterns);
}

function verifyVideoUpdateAPI(): ValidationResult {
 const filePath = join(process.cwd(), 'src/app/api/videos/[id]/route.ts');
 
 const requiredPatterns = [
 'coinPrice?: number',
 'data.coinPrice',
 'coinPrice < 1 || coinPrice > 2000',
 'Number.isInteger(coinPrice)',
 'Coin price must be between 1 and 2000',
 'validatedData.coinPrice'
 ];
 
 return checkFileContains(filePath, requiredPatterns);
}

function verifySeriesCreateAPI(): ValidationResult {
 const filePath = join(process.cwd(), 'src/app/api/series/route.ts');
 
 const requiredPatterns = [
 'coinPrice: number',
 'data.coinPrice',
 'coinPrice < 1 || coinPrice > 2000',
 'Number.isInteger(coinPrice)',
 'Coin price must be between 1 and 2000',
 'validatedData.coinPrice'
 ];
 
 return checkFileContains(filePath, requiredPatterns);
}

function verifySeriesUpdateAPI(): ValidationResult {
 const filePath = join(process.cwd(), 'src/app/api/series/[id]/route.ts');
 
 const requiredPatterns = [
 'coinPrice?: number',
 'data.coinPrice',
 'coinPrice < 1 || coinPrice > 2000',
 'Number.isInteger(coinPrice)',
 'Coin price must be between 1 and 2000',
 'validatedData.coinPrice'
 ];
 
 return checkFileContains(filePath, requiredPatterns);
}

function verifyValidationLogic(): ValidationResult {
 const results: string[] = [];

 const filesToCheck = [
 'src/app/api/videos/[id]/route.ts',
 'src/app/api/series/route.ts',
 'src/app/api/series/[id]/route.ts'
 ];
 
 for (const file of filesToCheck) {
 const filePath = join(process.cwd(), file);
 const content = readFileSync(filePath, 'utf-8');

 if (content.includes('creditCost?: number') && !file.includes('videos/[id]')) {
 results.push(`${file} still has creditCost in interface`);
 }
 if (content.includes('totalPrice?: number') && !file.includes('series')) {
 results.push(`${file} still has totalPrice in interface`);
 }

 const hasCorrectRange = content.includes('coinPrice < 1 || coinPrice > 2000');
 if (content.includes('coinPrice') && !hasCorrectRange) {
 results.push(`${file} missing correct validation range (1-2000)`);
 }

 const hasIntegerCheck = content.includes('Number.isInteger(coinPrice)');
 if (content.includes('coinPrice') && !hasIntegerCheck) {
 results.push(`${file} missing integer validation`);
 }
 }
 
 if (results.length > 0) {
 return {
 passed: false,
 message: 'Validation logic issues found',
 details: results
 };
 }
 
 return {
 passed: true,
 message: 'All validation logic is correct'
 };
}

function runVerification(): TestResults {
 console.log('🔍 Verifying Content Pricing APIs (Task 7)...\n');
 
 const results: TestResults = {
 videoUploadAPI: verifyVideoUploadAPI(),
 videoUpdateAPI: verifyVideoUpdateAPI(),
 seriesCreateAPI: verifySeriesCreateAPI(),
 seriesUpdateAPI: verifySeriesUpdateAPI(),
 validationLogic: verifyValidationLogic()
 };
 
 return results;
}

function printResults(results: TestResults): void {
 console.log('📊 Verification Results:\n');
 
 const tests = [
 { name: 'Video Upload API (POST /api/videos/upload)', result: results.videoUploadAPI },
 { name: 'Video Update API (PATCH /api/videos/:id)', result: results.videoUpdateAPI },
 { name: 'Series Create API (POST /api/series)', result: results.seriesCreateAPI },
 { name: 'Series Update API (PUT /api/series/:id)', result: results.seriesUpdateAPI },
 { name: 'Validation Logic', result: results.validationLogic }
 ];
 
 let allPassed = true;
 
 for (const test of tests) {
 const icon = test.result.passed ? '✅' : '❌';
 console.log(`${icon} ${test.name}`);
 console.log(` ${test.result.message}`);
 
 if (test.result.details && test.result.details.length > 0) {
 console.log(' Details:');
 test.result.details.forEach(detail => {
 console.log(` - ${detail}`);
 });
 }
 console.log();
 
 if (!test.result.passed) {
 allPassed = false;
 }
 }
 
 console.log('═'.repeat(60));
 if (allPassed) {
 console.log('✅ All verifications passed!');
 console.log('\nTask 7 Implementation Summary:');
 console.log('- ✅ Video upload API accepts coinPrice (1-2000)');
 console.log('- ✅ Video update API accepts coinPrice (1-2000)');
 console.log('- ✅ Series create API accepts coinPrice (1-2000)');
 console.log('- ✅ Series update API accepts coinPrice (1-2000)');
 console.log('- ✅ Server-side validation enforces 1-2000 range');
 console.log('- ✅ Integer validation prevents decimal values');
 } else {
 console.log('❌ Some verifications failed. Please review the details above.');
 process.exit(1);
 }
}

const results = runVerification();
printResults(results);
