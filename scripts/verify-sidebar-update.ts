

import { getMemberNavigationItems } from '../src/lib/navigation-utils';

console.log('🔍 Verifying User Sidebar Updates...\n');

console.log('Test 1: Checking navigation items structure');
const navItems = getMemberNavigationItems(0, 100);

const expectedItems = ['Home', 'Browse', 'My Library', 'Coin Balance', 'Settings'];
const actualItems = navItems.map(item => item.name);

console.log('Expected items:', expectedItems);
console.log('Actual items:', actualItems);

const itemsMatch = JSON.stringify(expectedItems) === JSON.stringify(actualItems);
console.log(itemsMatch ? '✅ Navigation items match expected structure' : '❌ Navigation items do not match');

console.log('\nTest 2: Verifying Member Statistics is removed');
const hasMemberStats = navItems.some(item => 
 item.name.toLowerCase().includes('statistics') || 
 item.name.toLowerCase().includes('analytics')
);
console.log(hasMemberStats ? '❌ Member Statistics still present' : '✅ Member Statistics removed');

console.log('\nTest 3: Verifying Coin Balance item');
const coinBalanceItem = navItems.find(item => item.name === 'Coin Balance');

if (coinBalanceItem) {
 console.log('✅ Coin Balance item found');
 console.log(' - href:', coinBalanceItem.href);
 console.log(' - icon:', coinBalanceItem.icon);
 console.log(' - badge:', coinBalanceItem.badge);
 console.log(' - showBadgeAsCoins:', coinBalanceItem.showBadgeAsCoins);
 
 const isValid = 
 coinBalanceItem.href === '/wallet' &&
 coinBalanceItem.icon === 'wallet' &&
 coinBalanceItem.badge === 100 &&
 coinBalanceItem.showBadgeAsCoins === true;
 
 console.log(isValid ? '✅ Coin Balance item configured correctly' : '❌ Coin Balance item configuration incorrect');
} else {
 console.log('❌ Coin Balance item not found');
}

console.log('\nTest 4: Verifying all items have required properties');
const allItemsValid = navItems.every(item => 
 item.name && 
 item.href && 
 item.icon && 
 item.description
);
console.log(allItemsValid ? '✅ All items have required properties' : '❌ Some items missing required properties');

console.log('\nTest 5: Verifying removed items');
const removedItems = ['Watch History', 'Analytics', 'Membership', 'Notifications', 'Profile', 'Preferences', 'Help'];
const hasRemovedItems = navItems.some(item => removedItems.includes(item.name));
console.log(hasRemovedItems ? '❌ Some removed items still present' : '✅ All specified items removed');

console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

const allTestsPassed = 
 itemsMatch && 
 !hasMemberStats && 
 coinBalanceItem !== undefined && 
 allItemsValid && 
 !hasRemovedItems;

if (allTestsPassed) {
 console.log('✅ All tests passed! User sidebar update is complete.');
 process.exit(0);
} else {
 console.log('❌ Some tests failed. Please review the implementation.');
 process.exit(1);
}
