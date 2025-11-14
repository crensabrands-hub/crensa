

const BASE_URL = 'http://localhost:3000';

async function testCategoryAPI() {
 console.log('🧪 Testing Category API...\n');
 
 try {
 const response = await fetch(`${BASE_URL}/api/home/categories`);
 const categories = await response.json();
 
 console.log('✅ Categories API Response:');
 console.log(JSON.stringify(categories, null, 2));
 console.log(`\n📊 Found ${categories.length} categories\n`);
 
 return categories;
 } catch (error) {
 console.error('❌ Categories API Error:', error.message);
 return [];
 }
}

async function testDiscoverAPI(category = null) {
 console.log(`🧪 Testing Discover API${category ? ` with category: ${category}` : ' (all videos)'}...\n`);
 
 try {
 const params = new URLSearchParams({ page: '1', limit: '5' });
 if (category) {
 params.append('category', category);
 }
 
 const response = await fetch(`${BASE_URL}/api/discover/videos?${params.toString()}`);
 const data = await response.json();
 
 console.log(`✅ Discover API Response${category ? ` for ${category}` : ''}:`);
 console.log(`Success: ${data.success}`);
 console.log(`Video Count: ${data.videos?.length || 0}`);
 console.log(`Total Videos: ${data.pagination?.total || 0}`);
 
 if (data.videos && data.videos.length > 0) {
 console.log('\n📹 Sample Videos:');
 data.videos.slice(0, 3).forEach((video, index) => {
 console.log(` ${index + 1}. ${video.title} (${video.category})`);
 });
 } else {
 console.log('📭 No videos found');
 }
 
 console.log(''); // Empty line for spacing
 return data;
 } catch (error) {
 console.error(`❌ Discover API Error${category ? ` for ${category}` : ''}:`, error.message);
 return null;
 }
}

async function runTests() {
 console.log('🚀 Starting Category Filtering Tests\n');
 console.log('=' .repeat(50));

 const categories = await testCategoryAPI();
 
 console.log('=' .repeat(50));

 await testDiscoverAPI();

 const testCategories = ['dance', 'comedy', 'education'];
 
 for (const category of testCategories) {
 console.log('=' .repeat(50));
 await testDiscoverAPI(category);
 }
 
 console.log('=' .repeat(50));
 console.log('🏁 Category Filtering Tests Complete!');
}

async function checkServer() {
 try {
 const response = await fetch(`${BASE_URL}/api/home/categories`);
 return response.ok;
 } catch (error) {
 return false;
 }
}

checkServer().then(isRunning => {
 if (!isRunning) {
 console.log('❌ Server is not running at http://localhost:3000');
 console.log('💡 Please start the development server with: npm run dev');
 process.exit(1);
 }
 
 runTests().catch(error => {
 console.error('❌ Test execution failed:', error);
 process.exit(1);
 });
});