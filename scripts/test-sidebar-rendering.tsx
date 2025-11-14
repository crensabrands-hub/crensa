
const testNavigationItems = () => {
 console.log('Testing navigation items...');
 
 const expectedItems = [
 'Home',
 'Browse', 
 'My Library',
 'Coin Balance',
 'Settings'
 ];
 
 const sidebar = document.querySelector('[role="navigation"][aria-label="Member navigation"]');
 
 if (!sidebar) {
 console.error('❌ Sidebar not found');
 return false;
 }
 
 console.log('✅ Sidebar found');

 expectedItems.forEach(item => {
 const link = Array.from(sidebar.querySelectorAll('a')).find(
 a => a.textContent?.includes(item)
 );
 
 if (link) {
 console.log(`✅ Found: ${item}`);
 } else {
 console.error(`❌ Missing: ${item}`);
 }
 });

 const removedItems = [
 'Member Statistics',
 'Analytics',
 'Watch History',
 'Notifications',
 'Profile',
 'Membership'
 ];
 
 removedItems.forEach(item => {
 const link = Array.from(sidebar.querySelectorAll('a')).find(
 a => a.textContent?.includes(item)
 );
 
 if (!link) {
 console.log(`✅ Correctly removed: ${item}`);
 } else {
 console.error(`❌ Should be removed: ${item}`);
 }
 });

 const coinBalanceLink = Array.from(sidebar.querySelectorAll('a')).find(
 a => a.textContent?.includes('Coin Balance')
 );
 
 if (coinBalanceLink) {
 const badge = coinBalanceLink.querySelector('span[class*="bg-primary-neon-yellow"]');
 if (badge) {
 console.log('✅ Coin balance badge found with correct styling');
 console.log(' Badge value:', badge.textContent);
 } else {
 console.warn('⚠️ Coin balance badge not found or incorrect styling');
 }
 }
 
 return true;
};

console.log('🔍 Starting sidebar rendering test...\n');
testNavigationItems();
console.log('\n✅ Test complete!');
