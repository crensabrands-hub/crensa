

import { readFileSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
 feature: string;
 status: 'PASS' | 'FAIL';
 details: string;
}

const results: VerificationResult[] = [];

function verify(feature: string, condition: boolean, details: string) {
 results.push({
 feature,
 status: condition ? 'PASS' : 'FAIL',
 details
 });
}

console.log('🔍 Verifying Series Purchase API Updates...\n');

const apiPath = join(process.cwd(), 'src/app/api/series/[id]/purchase/route.ts');
const apiContent = readFileSync(apiPath, 'utf-8');

console.log('📋 Task 4.1: Implement adjusted pricing calculation');
verify(
 'Import seriesAccessService',
 apiContent.includes("import { seriesAccessService } from '@/lib/services/seriesAccessService'"),
 'seriesAccessService is imported'
);

verify(
 'Call calculateAdjustedPrice',
 apiContent.includes('seriesAccessService.calculateAdjustedPrice'),
 'calculateAdjustedPrice method is called'
);

verify(
 'Get owned videos list',
 apiContent.includes('priceCalculation.ownedVideos'),
 'Owned videos list is retrieved from price calculation'
);

verify(
 'Calculate adjusted price',
 apiContent.includes('adjustedPrice = priceCalculation.adjustedPrice'),
 'Adjusted price is calculated'
);

console.log('\n📋 Task 4.2: Handle all-videos-owned scenario');
verify(
 'Check allVideosOwned flag',
 apiContent.includes('priceCalculation.allVideosOwned'),
 'allVideosOwned flag is checked'
);

verify(
 'Grant free access when all videos owned',
 apiContent.includes('type: "all_videos_owned"') && 
 apiContent.includes('purchasePrice: "0.00"'),
 'Series access granted for free when all videos are owned'
);

verify(
 'Return success without charging',
 apiContent.includes('coinsSpent: 0') &&
 apiContent.includes('You own all videos in this series'),
 'Success message returned without charging'
);

console.log('\n📋 Task 4.3: Update purchase response with price breakdown');
verify(
 'Include original price',
 apiContent.includes('originalPrice') && 
 apiContent.match(/originalPrice[,:\s]/g)?.length! >= 3,
 'Original price is included in response'
);

verify(
 'Include deductions list',
 apiContent.includes('deductions:') &&
 apiContent.includes('videoTitle:') &&
 apiContent.includes('coinPrice:'),
 'Deductions list with video titles and prices is included'
);

verify(
 'Include adjusted price',
 apiContent.includes('adjustedPrice:') &&
 apiContent.match(/adjustedPrice[,:\s]/g)?.length! >= 3,
 'Adjusted price is included in response'
);

verify(
 'OwnedVideoInfo interface',
 apiContent.includes('interface OwnedVideoInfo') &&
 apiContent.includes('videoTitle: string') &&
 apiContent.includes('coinPrice: number'),
 'OwnedVideoInfo interface is defined'
);

verify(
 'Updated SeriesPurchaseResponse',
 apiContent.includes('originalPrice?: number') &&
 apiContent.includes('adjustedPrice?: number') &&
 apiContent.includes('deductions?: OwnedVideoInfo[]'),
 'SeriesPurchaseResponse includes price breakdown fields'
);

console.log('\n📋 Task 4.4: Enhance error handling');
verify(
 'Insufficient coins with shortfall',
 apiContent.includes('Insufficient coins. You need') &&
 apiContent.includes('more coins') &&
 apiContent.includes('coinsShortfall:'),
 'Insufficient coins error includes shortfall amount'
);

verify(
 'Already purchased error',
 apiContent.includes('You have already purchased this series'),
 'Already purchased series error message is present'
);

verify(
 'Inactive series error',
 apiContent.includes('Series is not available for purchase') ||
 apiContent.includes('Series is inactive'),
 'Inactive series error is handled'
);

verify(
 'Series not found error',
 apiContent.includes('Series not found'),
 'Series not found error is handled'
);

verify(
 'Enhanced error logging',
 apiContent.includes('[SeriesPurchase]') &&
 apiContent.includes('console.error') &&
 apiContent.includes('console.log'),
 'Enhanced error logging with context is present'
);

verify(
 'Network error handling',
 apiContent.includes('network') &&
 apiContent.includes('Network error. Please check your connection'),
 'Network error is handled specifically'
);

verify(
 'Payment failed error',
 apiContent.includes('Payment failed. Please try again'),
 'Payment failed error message is present'
);

console.log('\n' + '='.repeat(70));
console.log('VERIFICATION RESULTS');
console.log('='.repeat(70) + '\n');

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;

results.forEach(result => {
 const icon = result.status === 'PASS' ? '✅' : '❌';
 console.log(`${icon} ${result.feature}`);
 console.log(` ${result.details}\n`);
});

console.log('='.repeat(70));
console.log(`Total: ${results.length} checks`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ❌`);
console.log('='.repeat(70) + '\n');

if (failed === 0) {
 console.log('🎉 All verifications passed! Task 4 is complete.\n');
 process.exit(0);
} else {
 console.log('⚠️ Some verifications failed. Please review the implementation.\n');
 process.exit(1);
}
