#!/usr/bin/env tsx

import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'

config({ path: '.env.local' })

console.log('🔐 Testing Cloudinary Signature Generation\n')
console.log('=' .repeat(60))

cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
})

const timestamp = Math.round(Date.now() / 1000)
const publicId = `crensa/videos/test_${Date.now()}`

console.log('\n📋 Test Parameters:')
console.log(` Timestamp: ${timestamp}`)
console.log(` Public ID: ${publicId}`)
console.log(` Folder: crensa/videos`)
console.log(` Eager Async: true`)

const paramsToSign: Record<string, any> = {
 timestamp: timestamp,
 public_id: publicId,
 folder: "crensa/videos",
 eager_async: true,
}

console.log('\n🔑 Generating Signature...')

try {

 const signature = cloudinary.utils.api_sign_request(
 paramsToSign,
 process.env.CLOUDINARY_API_SECRET!
 )

 console.log('✅ Signature generated successfully!')
 console.log(` Signature: ${signature}`)

 const sortedParams = Object.keys(paramsToSign)
 .sort()
 .map(key => `${key}=${paramsToSign[key]}`)
 .join('&')
 
 console.log('\n📝 String to Sign:')
 console.log(` ${sortedParams}`)

 console.log('\n📤 Upload Parameters (what gets sent to Cloudinary):')
 const uploadParams = {
 timestamp: timestamp,
 public_id: publicId,
 folder: "crensa/videos",
 eager_async: true,
 signature: signature,
 api_key: process.env.CLOUDINARY_API_KEY,
 }
 console.log(JSON.stringify(uploadParams, null, 2))

 console.log('\n✅ Signature test passed!')
 console.log('\n💡 Tips:')
 console.log(' - Only sign parameters that are sent to Cloudinary')
 console.log(' - Do NOT include undefined values')
 console.log(' - Do NOT include resource_type (it\'s in the URL)')
 console.log(' - Do NOT include api_key in signature (add it after)')
 console.log(' - Parameters are sorted alphabetically for signing')

} catch (error) {
 console.error('❌ Signature generation failed!')
 console.error(error)
 process.exit(1)
}

console.log('\n' + '='.repeat(60))
