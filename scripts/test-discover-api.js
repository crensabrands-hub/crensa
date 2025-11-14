

const fetch = require('node-fetch');

async function testDiscoverAPI() {
 try {
 console.log('Testing discover API...');

 const response = await fetch('http://localhost:3000/api/discover/videos');
 const data = await response.json();
 
 console.log('Response status:', response.status);
 console.log('Response data:', JSON.stringify(data, null, 2));
 
 } catch (error) {
 console.error('Error testing discover API:', error.message);
 }
}

testDiscoverAPI();