#!/usr/bin/env tsx

import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'fs'
import * as path from 'path'

config({ path: '.env.local' })

console.log('🔍 Video Upload Diagnostic Tool\n')
console.log('=' .repeat(60))

console.log('\n📋 Checking Environment Variables...')
const requiredEnvVars = [
 'CLOUDINARY_CLOUD_NAME',
 'CLOUDINARY_API_KEY',
 'CLOUDINARY_API_SECRET'
]

let envVarsOk = true
for (const envVar of requiredEnvVars) {
 const value = process.env[envVar]
 if (!value) {
 console.log(`❌ ${envVar}: NOT SET`)
 envVarsOk = false
 } else {
 console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`)
 }
}

if (!envVarsOk) {
 console.log('\n⚠️ Missing Cloudinary environment variables!')
 console.log('Please set them in your .env.local file')
 process.exit(1)
}

console.log('\n☁️ Testing Cloudinary Connection...')
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
})

try {

 const result = await cloudinary.api.ping()
 console.log('✅ Cloudinary connection successful!')
 console.log(` Status: ${result.status}`)
} catch (error: any) {
 console.log('❌ Cloudinary connection failed!')
 console.log(` Error: ${error.message}`)
 process.exit(1)
}

console.log('\n📁 Checking API Routes...')
const apiRoutes = [
 'src/app/api/videos/upload/route.ts',
 'src/app/api/videos/upload-url/route.ts',
 'src/app/api/videos/save/route.ts'
]

let routesOk = true
for (const route of apiRoutes) {
 const routePath = path.join(process.cwd(), route)
 if (fs.existsSync(routePath)) {
 console.log(`✅ ${route}`)
 } else {
 console.log(`❌ ${route} - NOT FOUND`)
 routesOk = false
 }
}

if (!routesOk) {
 console.log('\n⚠️ Some API routes are missing!')
}

console.log('\n⚙️ Checking Upload Configuration...')

const uploadUrlPath = path.join(process.cwd(), 'src/app/api/videos/upload-url/route.ts')
if (fs.existsSync(uploadUrlPath)) {
 const content = fs.readFileSync(uploadUrlPath, 'utf-8')
 
 if (content.includes('eager_async: true')) {
 console.log('✅ Async processing enabled (eager_async: true)')
 } else {
 console.log('⚠️ Async processing not enabled - may cause "too large" errors')
 }
 
 if (content.includes('eager_notification_url')) {
 console.log('✅ Notification URL configured for async completion')
 } else {
 console.log('ℹ️ No notification URL (optional)')
 }
}

console.log('\n🎨 Checking Frontend Upload Component...')
const uploadComponentPath = path.join(process.cwd(), 'src/components/creator/VideoUpload.tsx')
if (fs.existsSync(uploadComponentPath)) {
 const content = fs.readFileSync(uploadComponentPath, 'utf-8')
 
 if (content.includes('/api/videos/upload-url')) {
 console.log('✅ Frontend calls /api/videos/upload-url')
 } else {
 console.log('❌ Frontend does not call /api/videos/upload-url')
 }
 
 if (content.includes('/api/videos/save')) {
 console.log('✅ Frontend calls /api/videos/save')
 } else {
 console.log('❌ Frontend does not call /api/videos/save')
 }
 
 const maxSizeMatch = content.match(/MAX_FILE_SIZE\s*=\s*(\d+)\s*\*\s*1024\s*\*\s*1024/)
 if (maxSizeMatch) {
 console.log(`✅ Max file size: ${maxSizeMatch[1]}MB`)
 }
}

console.log('\n' + '='.repeat(60))
console.log('\n📊 Diagnostic Summary:')
console.log(` Environment Variables: ${envVarsOk ? '✅ OK' : '❌ ISSUES'}`)
console.log(` Cloudinary Connection: ✅ OK`)
console.log(` API Routes: ${routesOk ? '✅ OK' : '❌ ISSUES'}`)

console.log('\n💡 Common Issues and Solutions:')
console.log('\n1. "Video too large to process synchronously" error:')
console.log(' ✓ Fixed by using eager_async: true in upload-url route')
console.log(' ✓ This processes transformations asynchronously')
console.log('\n2. Missing /api/videos/upload-url route:')
console.log(' ✓ Route has been created')
console.log(' ✓ Generates signed URLs for direct Cloudinary upload')
console.log('\n3. Large file uploads timing out:')
console.log(' ✓ Direct upload to Cloudinary (bypasses Next.js)')
console.log(' ✓ Async processing prevents timeout errors')

console.log('\n✨ Next Steps:')
console.log(' 1. Restart your development server')
console.log(' 2. Try uploading a video')
console.log(' 3. Check browser console for any errors')
console.log(' 4. Check server logs for detailed error messages')

console.log('\n' + '='.repeat(60))
