

import {
 COINS_PER_RUPEE,
 MIN_COIN_PRICE,
 MAX_COIN_PRICE,
 MIN_COIN_BALANCE,
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
} from '../coin-utils';

describe('Coin Utility Constants', () => {
 test('COINS_PER_RUPEE should be 20', () => {
 expect(COINS_PER_RUPEE).toBe(20);
 });

 test('MIN_COIN_PRICE should be 1', () => {
 expect(MIN_COIN_PRICE).toBe(1);
 });

 test('MAX_COIN_PRICE should be 2000', () => {
 expect(MAX_COIN_PRICE).toBe(2000);
 });

 test('MIN_COIN_BALANCE should be 0', () => {
 expect(MIN_COIN_BALANCE).toBe(0);
 });
});

describe('Conversion Functions', () => {
 describe('coinsToRupees', () => {
 test('should convert 100 coins to 5 rupees', () => {
 expect(coinsToRupees(100)).toBe(5.00);
 });

 test('should convert 1000 coins to 50 rupees', () => {
 expect(coinsToRupees(1000)).toBe(50.00);
 });

 test('should convert 20 coins to 1 rupee', () => {
 expect(coinsToRupees(20)).toBe(1.00);
 });

 test('should convert 1 coin to 0.05 rupees', () => {
 expect(coinsToRupees(1)).toBe(0.05);
 });

 test('should convert 2000 coins to 100 rupees', () => {
 expect(coinsToRupees(2000)).toBe(100.00);
 });

 test('should handle 0 coins', () => {
 expect(coinsToRupees(0)).toBe(0);
 });

 test('should handle invalid input (NaN)', () => {
 expect(coinsToRupees(NaN)).toBe(0);
 });

 test('should handle invalid input (non-number)', () => {
 expect(coinsToRupees('100' as any)).toBe(0);
 });

 test('should round to 2 decimal places', () => {
 expect(coinsToRupees(33)).toBe(1.65);
 });
 });

 describe('rupeesToCoins', () => {
 test('should convert 5 rupees to 100 coins', () => {
 expect(rupeesToCoins(5)).toBe(100);
 });

 test('should convert 50 rupees to 1000 coins', () => {
 expect(rupeesToCoins(50)).toBe(1000);
 });

 test('should convert 1 rupee to 20 coins', () => {
 expect(rupeesToCoins(1)).toBe(20);
 });

 test('should convert 0.05 rupees to 1 coin', () => {
 expect(rupeesToCoins(0.05)).toBe(1);
 });

 test('should convert 100 rupees to 2000 coins', () => {
 expect(rupeesToCoins(100)).toBe(2000);
 });

 test('should handle 0 rupees', () => {
 expect(rupeesToCoins(0)).toBe(0);
 });

 test('should handle invalid input (NaN)', () => {
 expect(rupeesToCoins(NaN)).toBe(0);
 });

 test('should handle invalid input (non-number)', () => {
 expect(rupeesToCoins('5' as any)).toBe(0);
 });

 test('should round down to nearest integer', () => {
 expect(rupeesToCoins(10.5)).toBe(210);
 expect(rupeesToCoins(10.99)).toBe(219);
 });
 });
});

describe('Validation Functions', () => {
 describe('validateCoinPrice', () => {
 test('should validate coin price within range', () => {
 expect(validateCoinPrice(1)).toBe(true);
 expect(validateCoinPrice(100)).toBe(true);
 expect(validateCoinPrice(1000)).toBe(true);
 expect(validateCoinPrice(2000)).toBe(true);
 });

 test('should reject coin price below minimum', () => {
 expect(validateCoinPrice(0)).toBe(false);
 expect(validateCoinPrice(-1)).toBe(false);
 expect(validateCoinPrice(-100)).toBe(false);
 });

 test('should reject coin price above maximum', () => {
 expect(validateCoinPrice(2001)).toBe(false);
 expect(validateCoinPrice(3000)).toBe(false);
 expect(validateCoinPrice(10000)).toBe(false);
 });

 test('should reject invalid input', () => {
 expect(validateCoinPrice(NaN)).toBe(false);
 expect(validateCoinPrice('100' as any)).toBe(false);
 expect(validateCoinPrice(null as any)).toBe(false);
 expect(validateCoinPrice(undefined as any)).toBe(false);
 });
 });

 describe('validateCoinBalance', () => {
 test('should validate non-negative balance', () => {
 expect(validateCoinBalance(0)).toBe(true);
 expect(validateCoinBalance(100)).toBe(true);
 expect(validateCoinBalance(1000)).toBe(true);
 expect(validateCoinBalance(10000)).toBe(true);
 });

 test('should reject negative balance', () => {
 expect(validateCoinBalance(-1)).toBe(false);
 expect(validateCoinBalance(-100)).toBe(false);
 });

 test('should reject invalid input', () => {
 expect(validateCoinBalance(NaN)).toBe(false);
 expect(validateCoinBalance('100' as any)).toBe(false);
 expect(validateCoinBalance(null as any)).toBe(false);
 expect(validateCoinBalance(undefined as any)).toBe(false);
 });
 });

 describe('hasSufficientCoins', () => {
 test('should return true when balance is sufficient', () => {
 expect(hasSufficientCoins(100, 50)).toBe(true);
 expect(hasSufficientCoins(100, 100)).toBe(true);
 expect(hasSufficientCoins(1000, 500)).toBe(true);
 });

 test('should return false when balance is insufficient', () => {
 expect(hasSufficientCoins(50, 100)).toBe(false);
 expect(hasSufficientCoins(0, 1)).toBe(false);
 expect(hasSufficientCoins(99, 100)).toBe(false);
 });

 test('should return false for invalid balance', () => {
 expect(hasSufficientCoins(-10, 50)).toBe(false);
 expect(hasSufficientCoins(NaN, 50)).toBe(false);
 });

 test('should return false for invalid required coins', () => {
 expect(hasSufficientCoins(100, 0)).toBe(false);
 expect(hasSufficientCoins(100, -10)).toBe(false);
 expect(hasSufficientCoins(100, 3000)).toBe(false);
 });
 });
});

describe('Formatting Functions', () => {
 describe('formatCoins', () => {
 test('should format coins with default options', () => {
 expect(formatCoins(1000)).toBe('1,000 coins');
 expect(formatCoins(100)).toBe('100 coins');
 expect(formatCoins(1)).toBe('1 coins');
 });

 test('should format coins without label', () => {
 expect(formatCoins(1000, { showLabel: false })).toBe('1,000');
 expect(formatCoins(100, { showLabel: false })).toBe('100');
 });

 test('should format coins with icon', () => {
 expect(formatCoins(1000, { showIcon: true })).toBe('🪙 1,000 coins');
 expect(formatCoins(100, { showIcon: true })).toBe('🪙 100 coins');
 });

 test('should format coins with icon and no label', () => {
 expect(formatCoins(1000, { showIcon: true, showLabel: false })).toBe('🪙 1,000');
 });

 test('should handle 0 coins', () => {
 expect(formatCoins(0)).toBe('0 coins');
 });

 test('should handle invalid input', () => {
 expect(formatCoins(NaN)).toBe('0 coins');
 expect(formatCoins('100' as any)).toBe('0 coins');
 });

 test('should format large numbers with commas', () => {
 expect(formatCoins(10000)).toBe('10,000 coins');
 expect(formatCoins(100000)).toBe('1,00,000 coins'); // Indian locale
 });
 });

 describe('formatRupees', () => {
 test('should format rupees with default options', () => {
 expect(formatRupees(50.00)).toBe('₹50.00');
 expect(formatRupees(5.00)).toBe('₹5.00');
 expect(formatRupees(0.05)).toBe('₹0.05');
 });

 test('should format rupees without symbol', () => {
 expect(formatRupees(50.00, { showSymbol: false })).toBe('50.00');
 expect(formatRupees(5.00, { showSymbol: false })).toBe('5.00');
 });

 test('should handle 0 rupees', () => {
 expect(formatRupees(0)).toBe('₹0.00');
 });

 test('should handle invalid input', () => {
 expect(formatRupees(NaN)).toBe('₹0.00');
 expect(formatRupees('50' as any)).toBe('₹0.00');
 });

 test('should always show 2 decimal places', () => {
 expect(formatRupees(5)).toBe('₹5.00');
 expect(formatRupees(5.5)).toBe('₹5.50');
 expect(formatRupees(5.555)).toBe('₹5.56'); // Rounded
 });
 });

 describe('formatCoinsWithRupees', () => {
 test('should format coins with rupee equivalent', () => {
 expect(formatCoinsWithRupees(100)).toBe('100 coins (₹5.00)');
 expect(formatCoinsWithRupees(1000)).toBe('1,000 coins (₹50.00)');
 expect(formatCoinsWithRupees(20)).toBe('20 coins (₹1.00)');
 });

 test('should format with icon', () => {
 expect(formatCoinsWithRupees(1000, { showIcon: true })).toBe('🪙 1,000 coins (₹50.00)');
 });

 test('should handle 0 coins', () => {
 expect(formatCoinsWithRupees(0)).toBe('0 coins (₹0.00)');
 });
 });
});

describe('Error Message Functions', () => {
 describe('getCoinPriceErrorMessage', () => {
 test('should return error for invalid input', () => {
 expect(getCoinPriceErrorMessage(NaN)).toBe('Please enter a valid coin amount');
 expect(getCoinPriceErrorMessage('100' as any)).toBe('Please enter a valid coin amount');
 });

 test('should return error for price below minimum', () => {
 const message = getCoinPriceErrorMessage(0);
 expect(message).toContain('Minimum price is 1 coin');
 expect(message).toContain('₹0.05');
 });

 test('should return error for price above maximum', () => {
 const message = getCoinPriceErrorMessage(3000);
 expect(message).toContain('Maximum price is 2,000 coins');
 expect(message).toContain('₹100.00');
 });
 });

 describe('getInsufficientBalanceMessage', () => {
 test('should return correct shortfall message', () => {
 const message = getInsufficientBalanceMessage(50, 100);
 expect(message).toContain('Insufficient coins');
 expect(message).toContain('50 coins');
 });

 test('should handle large shortfall', () => {
 const message = getInsufficientBalanceMessage(100, 1000);
 expect(message).toContain('900 coins');
 });
 });
});

describe('Calculation Helper Functions', () => {
 describe('calculateTotalCoins', () => {
 test('should calculate total with bonus', () => {
 expect(calculateTotalCoins(100, 20)).toBe(120);
 expect(calculateTotalCoins(1000, 50)).toBe(1050);
 });

 test('should handle no bonus', () => {
 expect(calculateTotalCoins(100)).toBe(100);
 expect(calculateTotalCoins(100, 0)).toBe(100);
 });

 test('should handle 0 base coins', () => {
 expect(calculateTotalCoins(0, 20)).toBe(20);
 });
 });

 describe('getCoinPriceRangeInRupees', () => {
 test('should return correct rupee range', () => {
 const range = getCoinPriceRangeInRupees();
 expect(range.min).toBe(0.05);
 expect(range.max).toBe(100.00);
 });
 });
});

describe('Integration Tests', () => {
 test('should convert rupees to coins and back', () => {
 const rupees = 50;
 const coins = rupeesToCoins(rupees);
 const backToRupees = coinsToRupees(coins);
 expect(backToRupees).toBe(rupees);
 });

 test('should validate and format coin price', () => {
 const coins = 100;
 expect(validateCoinPrice(coins)).toBe(true);
 expect(formatCoins(coins)).toBe('100 coins');
 expect(formatCoinsWithRupees(coins)).toBe('100 coins (₹5.00)');
 });

 test('should check balance and provide error message', () => {
 const userBalance = 50;
 const requiredCoins = 100;
 expect(hasSufficientCoins(userBalance, requiredCoins)).toBe(false);
 const message = getInsufficientBalanceMessage(userBalance, requiredCoins);
 expect(message).toContain('50 coins');
 });
});
