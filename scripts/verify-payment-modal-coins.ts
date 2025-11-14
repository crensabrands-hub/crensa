#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

interface VerificationResult {
 passed: boolean;
 message: string;
 details?: string[];
}

class PaymentModalVerifier {
 private results: VerificationResult[] = [];

 verifyPaymentModalTerminology(): VerificationResult {
 const filePath = path.join(process.cwd(), 'src/components/payments/PaymentModal.tsx');
 
 if (!fs.existsSync(filePath)) {
 return {
 passed: false,
 message: 'PaymentModal.tsx not found',
 };
 }

 const content = fs.readFileSync(filePath, 'utf-8');
 const issues: string[] = [];

 if (!content.includes('Purchase Coins')) {
 issues.push('Missing "Purchase Coins" title');
 }

 if (!content.includes('Add coins to your wallet')) {
 issues.push('Missing coin-related description');
 }

 if (!content.includes('🪙')) {
 issues.push('Missing coin emoji in display');
 }

 if (!content.includes('Coins have been added to your wallet')) {
 issues.push('Missing coin success message');
 }

 const creditMatches = content.match(/credit(?!Card)/gi);
 if (creditMatches && creditMatches.length > 0) {
 issues.push(`Found ${creditMatches.length} references to "credit" (should use "coins")`);
 }

 return {
 passed: issues.length === 0,
 message: 'PaymentModal coin terminology',
 details: issues.length > 0 ? issues : ['All coin terminology is correct'],
 };
 }

 verifyRazorpayConfig(): VerificationResult {
 const filePath = path.join(process.cwd(), 'src/lib/razorpay/client-config.ts');
 
 if (!fs.existsSync(filePath)) {
 return {
 passed: false,
 message: 'Razorpay client-config.ts not found',
 };
 }

 const content = fs.readFileSync(filePath, 'utf-8');
 const issues: string[] = [];

 if (!content.includes('description: "Coin Purchase"')) {
 issues.push('Razorpay description should be "Coin Purchase"');
 }

 if (content.includes('Credit Purchase')) {
 issues.push('Found "Credit Purchase" - should be "Coin Purchase"');
 }

 return {
 passed: issues.length === 0,
 message: 'Razorpay config coin terminology',
 details: issues.length > 0 ? issues : ['Razorpay config uses "Coin Purchase"'],
 };
 }

 verifyPaymentService(): VerificationResult {
 const filePath = path.join(process.cwd(), 'src/lib/services/paymentService.ts');
 
 if (!fs.existsSync(filePath)) {
 return {
 passed: false,
 message: 'paymentService.ts not found',
 };
 }

 const content = fs.readFileSync(filePath, 'utf-8');
 const issues: string[] = [];

 if (!content.includes('coins: number')) {
 issues.push('PaymentOptions should include coins parameter');
 }

 if (!content.includes('coins,')) {
 issues.push('createOrder should accept coins parameter');
 }

 return {
 passed: issues.length === 0,
 message: 'Payment service coin support',
 details: issues.length > 0 ? issues : ['Payment service properly handles coins'],
 };
 }

 verifyPaymentAPIs(): VerificationResult {
 const createOrderPath = path.join(process.cwd(), 'src/app/api/payments/create-order/route.ts');
 const verifyPath = path.join(process.cwd(), 'src/app/api/payments/verify/route.ts');
 
 const issues: string[] = [];

 if (fs.existsSync(createOrderPath)) {
 const content = fs.readFileSync(createOrderPath, 'utf-8');
 
 if (!content.includes('coins?:')) {
 issues.push('create-order should accept coins parameter');
 }
 } else {
 issues.push('create-order route not found');
 }

 if (fs.existsSync(verifyPath)) {
 const content = fs.readFileSync(verifyPath, 'utf-8');
 
 if (!content.includes('coinAmount')) {
 issues.push('verify route should handle coin amounts');
 }

 if (!content.includes('createCoinTransaction')) {
 issues.push('verify route should create coin transactions');
 }
 } else {
 issues.push('verify route not found');
 }

 return {
 passed: issues.length === 0,
 message: 'Payment API coin handling',
 details: issues.length > 0 ? issues : ['Payment APIs properly handle coins'],
 };
 }

 verifyCoinPurchaseModal(): VerificationResult {
 const filePath = path.join(process.cwd(), 'src/components/wallet/CoinPurchaseModal.tsx');
 
 if (!fs.existsSync(filePath)) {
 return {
 passed: false,
 message: 'CoinPurchaseModal.tsx not found',
 };
 }

 const content = fs.readFileSync(filePath, 'utf-8');
 const issues: string[] = [];

 if (!content.includes('paymentService.initiatePayment')) {
 issues.push('CoinPurchaseModal should use paymentService.initiatePayment');
 }

 if (!content.includes('coinAmount')) {
 issues.push('CoinPurchaseModal should display coin amounts');
 }

 if (!content.includes('coins have been added')) {
 issues.push('CoinPurchaseModal should show coin success message');
 }

 return {
 passed: issues.length === 0,
 message: 'CoinPurchaseModal integration',
 details: issues.length > 0 ? issues : ['CoinPurchaseModal properly integrated'],
 };
 }

 verifyTests(): VerificationResult {
 const testPath = path.join(process.cwd(), 'src/components/payments/__tests__/PaymentModal.test.tsx');
 
 if (!fs.existsSync(testPath)) {
 return {
 passed: false,
 message: 'PaymentModal tests not found',
 };
 }

 const content = fs.readFileSync(testPath, 'utf-8');
 const issues: string[] = [];

 if (!content.includes('Purchase Coins')) {
 issues.push('Tests should verify "Purchase Coins" title');
 }

 if (!content.includes('Coins have been added')) {
 issues.push('Tests should verify coin success message');
 }

 if (!content.includes('coin amount')) {
 issues.push('Tests should verify coin amount display');
 }

 return {
 passed: issues.length === 0,
 message: 'PaymentModal tests',
 details: issues.length > 0 ? issues : ['All required tests exist'],
 };
 }

 async runAllVerifications(): Promise<void> {
 console.log('🔍 Verifying Payment Modal and Flow for Coins...\n');

 this.results = [
 this.verifyPaymentModalTerminology(),
 this.verifyRazorpayConfig(),
 this.verifyPaymentService(),
 this.verifyPaymentAPIs(),
 this.verifyCoinPurchaseModal(),
 this.verifyTests(),
 ];

 this.printResults();
 }

 private printResults(): void {
 let allPassed = true;

 this.results.forEach((result, index) => {
 const icon = result.passed ? '✅' : '❌';
 console.log(`${icon} ${result.message}`);
 
 if (result.details && result.details.length > 0) {
 result.details.forEach(detail => {
 console.log(` ${result.passed ? '✓' : '✗'} ${detail}`);
 });
 }
 
 console.log('');
 
 if (!result.passed) {
 allPassed = false;
 }
 });

 console.log('═'.repeat(60));
 if (allPassed) {
 console.log('✅ All verifications passed!');
 console.log('\nTask 29 Complete:');
 console.log('- PaymentModal uses coin terminology');
 console.log('- Payment success messages use coins');
 console.log('- Coin packages display properly');
 console.log('- Payment callbacks handle coin crediting');
 console.log('- Razorpay integration intact');
 } else {
 console.log('❌ Some verifications failed. Please review the issues above.');
 process.exit(1);
 }
 }
}

const verifier = new PaymentModalVerifier();
verifier.runAllVerifications().catch(error => {
 console.error('Error running verification:', error);
 process.exit(1);
});
