

export const COINS_PER_RUPEE = 20;

export const MIN_COIN_PRICE = 1;

export const MAX_COIN_PRICE = 2000;

export const MIN_COIN_BALANCE = 0;

export function coinsToRupees(coins: number): number {
 if (typeof coins !== 'number' || isNaN(coins)) {
 return 0;
 }
 return Math.round((coins / COINS_PER_RUPEE) * 100) / 100;
}

export function rupeesToCoins(rupees: number): number {
 if (typeof rupees !== 'number' || isNaN(rupees)) {
 return 0;
 }
 return Math.floor(rupees * COINS_PER_RUPEE);
}

export function validateCoinPrice(coins: number): boolean {
 if (typeof coins !== 'number' || isNaN(coins)) {
 return false;
 }
 return coins >= MIN_COIN_PRICE && coins <= MAX_COIN_PRICE;
}

export function validateCoinBalance(balance: number): boolean {
 if (typeof balance !== 'number' || isNaN(balance)) {
 return false;
 }
 return balance >= MIN_COIN_BALANCE;
}

export function hasSufficientCoins(userBalance: number, requiredCoins: number): boolean {
 if (!validateCoinBalance(userBalance) || !validateCoinPrice(requiredCoins)) {
 return false;
 }
 return userBalance >= requiredCoins;
}

export function formatCoins(
 coins: number,
 options: {
 showLabel?: boolean;
 showIcon?: boolean;
 locale?: string;
 } = {}
): string {
 const {
 showLabel = true,
 showIcon = false,
 locale = 'en-IN'
 } = options;

 if (typeof coins !== 'number' || isNaN(coins)) {
 coins = 0;
 }

 const formattedNumber = coins.toLocaleString(locale);
 const icon = showIcon ? '🪙 ' : '';
 const label = showLabel ? ' coins' : '';

 return `${icon}${formattedNumber}${label}`;
}

export function formatRupees(
 rupees: number,
 options: {
 showSymbol?: boolean;
 locale?: string;
 } = {}
): string {
 const {
 showSymbol = true,
 locale = 'en-IN'
 } = options;

 if (typeof rupees !== 'number' || isNaN(rupees)) {
 rupees = 0;
 }

 const formattedNumber = rupees.toLocaleString(locale, {
 minimumFractionDigits: 2,
 maximumFractionDigits: 2
 });

 return showSymbol ? `₹${formattedNumber}` : formattedNumber;
}

export function formatCoinsWithRupees(
 coins: number,
 options: {
 showIcon?: boolean;
 locale?: string;
 } = {}
): string {
 const coinStr = formatCoins(coins, { ...options, showLabel: true });
 const rupees = coinsToRupees(coins);
 const rupeeStr = formatRupees(rupees, { locale: options.locale });

 return `${coinStr} (${rupeeStr})`;
}

export function getCoinPriceErrorMessage(coins: number): string {
 if (typeof coins !== 'number' || isNaN(coins)) {
 return 'Please enter a valid coin amount';
 }
 if (coins < MIN_COIN_PRICE) {
 return `Minimum price is ${MIN_COIN_PRICE} coin (${formatRupees(coinsToRupees(MIN_COIN_PRICE))})`;
 }
 if (coins > MAX_COIN_PRICE) {
 return `Maximum price is ${formatCoins(MAX_COIN_PRICE)} (${formatRupees(coinsToRupees(MAX_COIN_PRICE))})`;
 }
 return 'Invalid coin amount';
}

export function getInsufficientBalanceMessage(userBalance: number, requiredCoins: number): string {
 const shortfall = requiredCoins - userBalance;
 return `Insufficient coins. You need ${formatCoins(shortfall)} more to complete this purchase.`;
}

export function calculateTotalCoins(baseCoins: number, bonusCoins: number = 0): number {
 return baseCoins + bonusCoins;
}

export function getCoinPriceRangeInRupees(): { min: number; max: number } {
 return {
 min: coinsToRupees(MIN_COIN_PRICE),
 max: coinsToRupees(MAX_COIN_PRICE)
 };
}
