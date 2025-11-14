

import { testDatabaseConnection, closeDatabaseConnection } from '../src/lib/database/connection'
import { userRepository } from '../src/lib/database/repositories'

async function verifyDatabase() {
 console.log('🔍 Verifying database setup...')

 try {

 console.log('📡 Testing database connection...')
 const isConnected = await testDatabaseConnection()
 
 if (!isConnected) {
 console.error('❌ Database connection failed')
 return false
 }
 
 console.log('✅ Database connection successful')

 console.log('🧪 Testing repository setup...')

 if (!userRepository) {
 console.error('❌ User repository not properly instantiated')
 return false
 }
 
 console.log('✅ Repositories properly instantiated')
 
 console.log('🎉 Database setup verification completed successfully!')
 return true

 } catch (error) {
 console.error('❌ Database verification failed:', error)
 return false
 } finally {
 await closeDatabaseConnection()
 }
}

if (require.main === module) {
 verifyDatabase()
 .then((success) => {
 process.exit(success ? 0 : 1)
 })
 .catch((error) => {
 console.error('Verification process failed:', error)
 process.exit(1)
 })
}

export { verifyDatabase }