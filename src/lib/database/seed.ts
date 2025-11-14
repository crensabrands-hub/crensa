

import { db } from './connection'
import { users, creatorProfiles, memberProfiles, videos, transactions, categories } from './schema'

export async function seedCategories() {
 try {
 console.log('Seeding categories...')

 const defaultCategories = [
 {
 name: 'Art & Design',
 slug: 'art-design',
 description: 'Creative content including digital art, traditional art, and design tutorials',
 iconUrl: '/icons/art-design.svg',
 displayOrder: 1
 },
 {
 name: 'Education',
 slug: 'education',
 description: 'Educational content, tutorials, and learning materials',
 iconUrl: '/icons/education.svg',
 displayOrder: 2
 },
 {
 name: 'Entertainment',
 slug: 'entertainment',
 description: 'Fun and entertaining content for all audiences',
 iconUrl: '/icons/entertainment.svg',
 displayOrder: 3
 },
 {
 name: 'Technology',
 slug: 'technology',
 description: 'Tech reviews, tutorials, and industry insights',
 iconUrl: '/icons/technology.svg',
 displayOrder: 4
 },
 {
 name: 'Lifestyle',
 slug: 'lifestyle',
 description: 'Lifestyle content including fashion, travel, and daily vlogs',
 iconUrl: '/icons/lifestyle.svg',
 displayOrder: 5
 },
 {
 name: 'Music',
 slug: 'music',
 description: 'Music performances, tutorials, and industry content',
 iconUrl: '/icons/music.svg',
 displayOrder: 6
 },
 {
 name: 'Gaming',
 slug: 'gaming',
 description: 'Gaming content, reviews, and gameplay videos',
 iconUrl: '/icons/gaming.svg',
 displayOrder: 7
 },
 {
 name: 'Fitness & Health',
 slug: 'fitness-health',
 description: 'Fitness routines, health tips, and wellness content',
 iconUrl: '/icons/fitness-health.svg',
 displayOrder: 8
 },
 {
 name: 'Business',
 slug: 'business',
 description: 'Business insights, entrepreneurship, and professional development',
 iconUrl: '/icons/business.svg',
 displayOrder: 9
 },
 {
 name: 'Comedy',
 slug: 'comedy',
 description: 'Comedy sketches, stand-up, and humorous content',
 iconUrl: '/icons/comedy.svg',
 displayOrder: 10
 }
 ]

 await db.insert(categories).values(defaultCategories)
 console.log(`Seeded ${defaultCategories.length} categories successfully!`)
 return defaultCategories

 } catch (error) {
 console.error('Categories seeding failed:', error)
 throw error
 }
}

export async function seedDatabase() {
 try {
 console.log('Seeding database...')

 const defaultCategories = await seedCategories()

 const creator1Result = await db.insert(users).values({
 clerkId: 'user_creator_1',
 email: 'creator1@example.com',
 username: 'creative_creator',
 role: 'creator',
 avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
 }).returning()
 const creator1 = (creator1Result as any[])[0]

 const creator2Result = await db.insert(users).values({
 clerkId: 'user_creator_2',
 email: 'creator2@example.com',
 username: 'amazing_artist',
 role: 'creator',
 avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
 }).returning()
 const creator2 = (creator2Result as any[])[0]

 const member1Result = await db.insert(users).values({
 clerkId: 'user_member_1',
 email: 'member1@example.com',
 username: 'video_lover',
 role: 'member',
 avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
 }).returning()
 const member1 = (member1Result as any[])[0]

 const member2Result = await db.insert(users).values({
 clerkId: 'user_member_2',
 email: 'member2@example.com',
 username: 'content_fan',
 role: 'member',
 avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
 }).returning()
 const member2 = (member2Result as any[])[0]

 await db.insert(creatorProfiles).values([
 {
 userId: creator1.id,
 displayName: 'Creative Creator',
 bio: 'I create amazing content for my audience. Follow me for daily inspiration!',
 totalEarnings: '1250.50',
 totalViews: 15420,
 videoCount: 23,
 socialLinks: [
 { platform: 'twitter', url: 'https://twitter.com/creative_creator' },
 { platform: 'instagram', url: 'https://instagram.com/creative_creator' }
 ]
 },
 {
 userId: creator2.id,
 displayName: 'Amazing Artist',
 bio: 'Digital artist sharing tutorials and creative processes.',
 totalEarnings: '890.25',
 totalViews: 8750,
 videoCount: 15,
 socialLinks: [
 { platform: 'youtube', url: 'https://youtube.com/@amazing_artist' },
 { platform: 'tiktok', url: 'https://tiktok.com/@amazing_artist' }
 ]
 }
 ])

 await db.insert(memberProfiles).values([
 {
 userId: member1.id,
 walletBalance: '45.75',
 membershipStatus: 'premium',
 membershipExpiry: new Date('2024-12-31'),
 watchHistory: [],
 favoriteCreators: [creator1.id, creator2.id]
 },
 {
 userId: member2.id,
 walletBalance: '12.50',
 membershipStatus: 'free',
 watchHistory: [],
 favoriteCreators: [creator1.id]
 }
 ])

 const sampleVideos = [
 {
 creatorId: creator1.id,
 title: 'Creative Process Behind My Latest Art',
 description: 'Join me as I walk through my creative process for this stunning digital artwork.',
 videoUrl: 'https://example.com/videos/creative-process-1.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
 duration: 180,
 creditCost: '2.50',
 coinPrice: 50,
 category: 'Art & Design',
 tags: ['art', 'digital', 'tutorial', 'creative'],
 viewCount: 1250,
 totalEarnings: '312.50',
 isActive: true
 },
 {
 creatorId: creator1.id,
 title: 'Quick Tips for Better Composition',
 description: 'Learn essential composition techniques that will improve your artwork instantly.',
 videoUrl: 'https://example.com/videos/composition-tips.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
 duration: 120,
 creditCost: '1.75',
 coinPrice: 35,
 category: 'Education',
 tags: ['tips', 'composition', 'art', 'tutorial'],
 viewCount: 890,
 totalEarnings: '155.75',
 isActive: true
 },
 {
 creatorId: creator2.id,
 title: 'Digital Painting Masterclass',
 description: 'Complete guide to digital painting techniques for beginners and advanced artists.',
 videoUrl: 'https://example.com/videos/digital-painting.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop',
 duration: 300,
 creditCost: '3.00',
 coinPrice: 60,
 category: 'Art & Design',
 tags: ['painting', 'digital', 'masterclass', 'advanced'],
 viewCount: 650,
 totalEarnings: '195.00',
 isActive: true
 },
 {
 creatorId: creator2.id,
 title: 'Color Theory Fundamentals',
 description: 'Understanding color theory to create more impactful and harmonious artwork.',
 videoUrl: 'https://example.com/videos/color-theory.mp4',
 thumbnailUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
 duration: 240,
 creditCost: '2.25',
 coinPrice: 45,
 category: 'Education',
 tags: ['color', 'theory', 'fundamentals', 'art'],
 viewCount: 420,
 totalEarnings: '94.50',
 isActive: true
 }
 ]

 const insertedVideos = await db.insert(videos).values(sampleVideos).returning()

 const sampleTransactions = [

 {
 userId: member1.id,
 type: 'credit_purchase' as const,
 amount: '50.00',
 razorpayPaymentId: 'pay_test_123456',
 razorpayOrderId: 'order_test_123456',
 status: 'completed' as const
 },
 {
 userId: member2.id,
 type: 'credit_purchase' as const,
 amount: '25.00',
 razorpayPaymentId: 'pay_test_789012',
 razorpayOrderId: 'order_test_789012',
 status: 'completed' as const
 },

 {
 userId: member1.id,
 videoId: insertedVideos[0].id,
 creatorId: creator1.id,
 type: 'video_view' as const,
 amount: '2.50',
 status: 'completed' as const
 },
 {
 userId: member1.id,
 videoId: insertedVideos[1].id,
 creatorId: creator1.id,
 type: 'video_view' as const,
 amount: '1.75',
 status: 'completed' as const
 },

 {
 userId: creator1.id,
 videoId: insertedVideos[0].id,
 creatorId: creator1.id,
 type: 'creator_earning' as const,
 amount: '2.50',
 status: 'completed' as const
 },
 {
 userId: creator1.id,
 videoId: insertedVideos[1].id,
 creatorId: creator1.id,
 type: 'creator_earning' as const,
 amount: '1.75',
 status: 'completed' as const
 }
 ]

 await db.insert(transactions).values(sampleTransactions)

 console.log('Database seeded successfully!')
 console.log(`Created:`)
 console.log(`- ${defaultCategories.length} categories`)
 console.log(`- 4 users (2 creators, 2 members)`)
 console.log(`- 4 videos`)
 console.log(`- 6 transactions`)

 } catch (error) {
 console.error('Seeding failed:', error)
 throw error
 }
}

if (require.main === module) {
 seedDatabase()
 .then(() => {
 console.log('Seeding process completed')
 process.exit(0)
 })
 .catch((error) => {
 console.error('Seeding process failed:', error)
 process.exit(1)
 })
}