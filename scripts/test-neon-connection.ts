

import { testDatabaseConnection, closeDatabaseConnection } from '../src/lib/database/connection'

async function testNeonConnection() {
    console.log('🔍 Testing Neon DB connection...')

    try {
        const isConnected = await testDatabaseConnection()

        if (isConnected) {
            console.log('✅ Neon DB connection successful!')
            console.log('🎉 Your database is ready to use')
            return true
        } else {
            console.log('❌ Neon DB connection failed')
            console.log('💡 Check your DATABASE_URL in .env.local')
            console.log('📖 See docs/NEON_DB_SETUP.md for setup instructions')
            return false
        }
    } catch (error) {
        console.error('❌ Connection test failed:', error)
        console.log('')
        console.log('🔧 Troubleshooting tips:')
        console.log(' 1. Verify your DATABASE_URL is correct')
        console.log(' 2. Ensure the connection string includes ?sslmode=require')
        console.log(' 3. Check that your Neon project is active')
        console.log(' 4. Verify your network connection')
        return false
    } finally {
        await closeDatabaseConnection()
    }
}

// Check if script is run directly
import { fileURLToPath } from 'url';
const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
    testNeonConnection()
        .then((success) => {
            process.exit(success ? 0 : 1)
        })
        .catch((error) => {
            console.error('Connection test process failed:', error)
            process.exit(1)
        })
}

export { testNeonConnection }