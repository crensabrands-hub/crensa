
const { execSync } = require('child_process');

console.log('Testing notification API endpoints...');

try {
 const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/notifications', { encoding: 'utf8' });
 console.log('API Response Code:', response.trim());
 
 if (response.trim() === '401') {
 console.log('✓ API endpoint exists and returns 401 (Unauthorized) as expected');
 } else {
 console.log('⚠ Unexpected response code');
 }
} catch (error) {
 console.log('❌ Server might not be running or API endpoint not accessible');
 console.log('Error:', error.message);
}