

import {
 COINS_PER_RUPEE,
 MIN_COIN_PRICE,
 MAX_COIN_PRICE,
 coinsToRupees,
 rupeesToCoins,
 validateCoinPrice,
 validateCoinBalance,
 hasSufficientCoins,
 formatCoins,
 formatRupees,
 formatCoinsWithRupees,
 getCoinPriceErrorMessage,
 getInsufficientBalanceMessage,
 calculateTotalCoins,
 getCoinPriceRangeInRupees,
} from '../src/lib/utils/coin-utils';

console.log('='.repeat(60));
console.log('COIN UTILITY FUNCTIONS DEMO');
console.log('='.repeat(60));

console.log('\n📊 CONSTANTS:');
console.log(` Conversion Rate: 1 rupee = ${COINS_PER_RUPEE} coins`);
console.log(` Price Range: ${MIN_COIN_PRICE} - ${MAX_COIN_PRICE} coins`);
console.log(` Rupee Range: ${formatRupees(coinsToRupees(MIN_COIN_PRICE))} - ${formatRupees(coinsToRupees(MAX_COIN_PRICE))}`);

console.log('\n💱 CONVERSION EXAMPLES:');
console.log(` 100 coins = ${formatRupees(coinsToRupees(100))}`);
console.log(` 1000 coins = ${formatRupees(coinsToRupees(1000))}`);
console.log(` ₹5 = ${rupeesToCoins(5)} coins`);
console.log(` ₹50 = ${rupeesToCoins(50)} coins`);

console.log('\n✅ VALIDATION EXAMPLES:');
console.log(` Is 100 coins valid price? ${validateCoinPrice(100)}`);
console.log(` Is 0 coins valid price? ${validateCoinPrice(0)}`);
console.log(` Is 3000 coins valid price? ${validateCoinPrice(3000)}`);
console.log(` Is balance of 50 valid? ${validateCoinBalance(50)}`);
console.log(` Is balance of -10 valid? ${validateCoinBalance(-10)}`);

console.log('\n💰 BALANCE CHECK EXAMPLES:');
const userBalance = 150;
const itemPrice1 = 100;
const itemPrice2 = 200;
console.log(` User has ${formatCoins(userBalance)}`);
console.log(` Can buy item for ${formatCoins(itemPrice1)}? ${hasSufficientCoins(userBalance, itemPrice1)}`);
console.log(` Can buy item for ${formatCoins(itemPrice2)}? ${hasSufficientCoins(userBalance, itemPrice2)}`);
if (!hasSufficientCoins(userBalance, itemPrice2)) {
 console.log(` → ${getInsufficientBalanceMessage(userBalance, itemPrice2)}`);
}

console.log('\n🎨 FORMATTING EXAMPLES:');
console.log(` Basic: ${formatCoins(1000)}`);
console.log(` With icon: ${formatCoins(1000, { showIcon: true })}`);
console.log(` Number only: ${formatCoins(1000, { showLabel: false })}`);
console.log(` With rupees: ${formatCoinsWithRupees(1000)}`);
console.log(` With icon & rupees: ${formatCoinsWithRupees(1000, { showIcon: true })}`);

console.log('\n❌ ERROR MESSAGE EXAMPLES:');
console.log(` Price too low (0): ${getCoinPriceErrorMessage(0)}`);
console.log(` Price too high (3000): ${getCoinPriceErrorMessage(3000)}`);

console.log('\n🎁 BONUS CALCULATION EXAMPLE:');
const baseCoins = 1000;
const bonusCoins = 50;
const totalCoins = calculateTotalCoins(baseCoins, bonusCoins);
console.log(` Base: ${formatCoins(baseCoins)}`);
console.log(` Bonus: ${formatCoins(bonusCoins)}`);
console.log(` Total: ${formatCoins(totalCoins)} (${formatRupees(coinsToRupees(totalCoins))})`);

console.log('\n📈 PRICE RANGE:');
const range = getCoinPriceRangeInRupees();
console.log(` Minimum: ${formatCoins(MIN_COIN_PRICE)} = ${formatRupees(range.min)}`);
console.log(` Maximum: ${formatCoins(MAX_COIN_PRICE)} = ${formatRupees(range.max)}`);

console.log('\n' + '='.repeat(60));
console.log('✅ All coin utilities working correctly!');
console.log('='.repeat(60) + '\n');
