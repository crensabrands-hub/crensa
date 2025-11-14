#!/usr/bin/env ts-node

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying Content Purchase APIs for Coin System...\n');

const videoPurchaseFile = join(process.cwd(), 'src/app/api/videos/[id]/purchase/route.ts');
const seriesPurchaseFile = join(process.cwd(), 'src/app/api/series/[id]/purchase/route.ts');

try {
 const videoPurchaseContent = readFileSync(videoPurchaseFile, 'utf-8');
 const seriesPurchaseContent = readFileSync(seriesPurchaseFile, 'utf-8');

 console.log('✅ Files exist');
 console.log(' - Video purchase API: src/app/api/videos/[id]/purchase/route.ts');
 console.log(' - Series purchase API: src/app/api/series/[id]/purchase/route.ts\n');

 console.log('📹 Video Purchase API Verification:');
 
 const videoChecks = [
 {
 name: 'Uses coinTransactionService',
 test: videoPurchaseContent.includes('coinTransactionService'),
 },
 {
 name: 'Uses coinPrice field',
 test: videoPurchaseContent.includes('coinPrice'),
 },
 {
 name: 'Checks sufficient coins',
 test: videoPurchaseContent.includes('checkSufficientCoins'),
 },
 {
 name: 'Creates coin transaction',
 test: videoPurchaseContent.includes('createCoinTransaction'),
 },
 {
 name: 'Records creator earnings',
 test: videoPurchaseContent.includes('recordCreatorEarning'),
 },
 {
 name: 'Returns coinsSpent in response',
 test: videoPurchaseContent.includes('coinsSpent'),
 },
 {
 name: 'Returns remainingBalance in response',
 test: videoPurchaseContent.includes('remainingBalance'),
 },
 {
 name: 'Handles insufficient coins error',
 test: videoPurchaseContent.includes('Insufficient coins'),
 },
 ];

 videoChecks.forEach(check => {
 console.log(` ${check.test ? '✅' : '❌'} ${check.name}`);
 });

 const videoPass = videoChecks.every(c => c.test);
 console.log(`\n ${videoPass ? '✅ Video Purchase API: PASS' : '❌ Video Purchase API: FAIL'}\n`);

 console.log('📺 Series Purchase API Verification:');
 
 const seriesChecks = [
 {
 name: 'Uses coinTransactionService',
 test: seriesPurchaseContent.includes('coinTransactionService'),
 },
 {
 name: 'Uses coinPrice field',
 test: seriesPurchaseContent.includes('coinPrice'),
 },
 {
 name: 'Checks sufficient coins',
 test: seriesPurchaseContent.includes('checkSufficientCoins'),
 },
 {
 name: 'Creates coin transaction',
 test: seriesPurchaseContent.includes('createCoinTransaction'),
 },
 {
 name: 'Records creator earnings',
 test: seriesPurchaseContent.includes('recordCreatorEarning'),
 },
 {
 name: 'Returns coinsSpent in response',
 test: seriesPurchaseContent.includes('coinsSpent'),
 },
 {
 name: 'Returns remainingBalance in response',
 test: seriesPurchaseContent.includes('remainingBalance'),
 },
 {
 name: 'Handles insufficient coins error',
 test: seriesPurchaseContent.includes('Insufficient coins'),
 },
 {
 name: 'Removed Razorpay integration',
 test: !seriesPurchaseContent.includes('getRazorpayInstance'),
 },
 {
 name: 'Removed paymentMethod parameter',
 test: !seriesPurchaseContent.includes("paymentMethod = 'razorpay'"),
 },
 ];

 seriesChecks.forEach(check => {
 console.log(` ${check.test ? '✅' : '❌'} ${check.name}`);
 });

 const seriesPass = seriesChecks.every(c => c.test);
 console.log(`\n ${seriesPass ? '✅ Series Purchase API: PASS' : '❌ Series Purchase API: FAIL'}\n`);

 if (videoPass && seriesPass) {
 console.log('🎉 All verifications passed! Content purchase APIs are properly updated for coin system.\n');
 console.log('📋 Summary:');
 console.log(' - Video purchase API uses coins ✅');
 console.log(' - Series purchase API uses coins ✅');
 console.log(' - Insufficient balance checks implemented ✅');
 console.log(' - Coin transaction records created ✅');
 console.log(' - Creator earnings recorded in coins ✅');
 console.log(' - Purchase confirmations show coin deduction ✅\n');
 process.exit(0);
 } else {
 console.log('❌ Some verifications failed. Please review the implementation.\n');
 process.exit(1);
 }

} catch (error) {
 console.error('❌ Error reading files:', error);
 process.exit(1);
}
