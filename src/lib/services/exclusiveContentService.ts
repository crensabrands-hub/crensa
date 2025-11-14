

import type { ExclusiveContent } from '@/types'

export class ExclusiveContentService {
 
 async getExclusiveContent(category?: string): Promise<ExclusiveContent[]> {

 const allExclusiveContent: ExclusiveContent[] = [
 {
 id: 'exclusive-1',
 title: 'Behind the Scenes: Creator Masterclass',
 description: 'Exclusive insights from top creators on building successful content',
 type: 'video',
 thumbnailUrl: '/images/exclusive-content-1.jpg',
 creatorId: 'creator-1',
 creator: {
 username: 'masterclass_creator',
 displayName: 'Sarah Johnson',
 avatar: '/images/creators/sarah.jpg'
 },
 requiredMembership: 'premium',
 isNew: true,
 releaseDate: new Date('2024-01-15')
 },
 {
 id: 'exclusive-2',
 title: 'Premium Comedy Series: Laugh Out Loud',
 description: 'A 10-episode comedy series exclusively for premium members',
 type: 'series',
 thumbnailUrl: '/images/exclusive-content-2.jpg',
 creatorId: 'creator-2',
 creator: {
 username: 'comedy_king',
 displayName: 'Mike Chen',
 avatar: '/images/creators/mike.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-10')
 },
 {
 id: 'exclusive-3',
 title: 'Live Q&A with Industry Experts',
 description: 'Interactive live session with leading industry professionals',
 type: 'live_event',
 thumbnailUrl: '/images/exclusive-content-3.jpg',
 creatorId: 'creator-3',
 creator: {
 username: 'expert_panel',
 displayName: 'Expert Panel',
 avatar: '/images/creators/panel.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-20')
 },
 {
 id: '1',
 title: 'Advanced Photography Techniques',
 description: 'Professional photography tips and techniques for content creators',
 type: 'video',
 thumbnailUrl: '/images/exclusive-content-4.jpg',
 creatorId: 'creator-4',
 creator: {
 username: 'photo_pro',
 displayName: 'Emma Wilson',
 avatar: '/images/creators/emma.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-12')
 },
 {
 id: '2',
 title: 'Exclusive Music Production Workshop',
 description: 'Learn advanced music production techniques from industry professionals',
 type: 'series',
 thumbnailUrl: '/images/exclusive-content-5.jpg',
 creatorId: 'creator-5',
 creator: {
 username: 'music_producer',
 displayName: 'Alex Rivera',
 avatar: '/images/creators/alex.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-08')
 },
 {
 id: '3',
 title: 'VIP Creator Meet & Greet',
 description: 'Exclusive virtual meet and greet session with popular creators',
 type: 'live_event',
 thumbnailUrl: '/images/exclusive-content-6.jpg',
 creatorId: 'creator-6',
 creator: {
 username: 'creator_collective',
 displayName: 'Creator Collective',
 avatar: '/images/creators/collective.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-25')
 },
 {
 id: '4',
 title: 'Premium Fitness Challenge',
 description: '30-day exclusive fitness challenge with personal trainers',
 type: 'series',
 thumbnailUrl: '/images/exclusive-content-7.jpg',
 creatorId: 'creator-7',
 creator: {
 username: 'fitness_guru',
 displayName: 'Jake Martinez',
 avatar: '/images/creators/jake.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-05')
 },
 {
 id: '5',
 title: 'Cooking Masterclass with Celebrity Chef',
 description: 'Learn professional cooking techniques from a Michelin-starred chef',
 type: 'video',
 thumbnailUrl: '/images/exclusive-content-8.jpg',
 creatorId: 'creator-8',
 creator: {
 username: 'chef_master',
 displayName: 'Isabella Rodriguez',
 avatar: '/images/creators/isabella.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-03')
 },
 {
 id: '6',
 title: 'Tech Innovation Summit',
 description: 'Exclusive access to tech industry insights and future trends',
 type: 'live_event',
 thumbnailUrl: '/images/exclusive-content-9.jpg',
 creatorId: 'creator-9',
 creator: {
 username: 'tech_visionary',
 displayName: 'David Kim',
 avatar: '/images/creators/david.jpg'
 },
 requiredMembership: 'premium',
 releaseDate: new Date('2024-01-30')
 }
 ]

 let filteredContent = allExclusiveContent
 if (category && category !== 'all') {
 filteredContent = allExclusiveContent.filter(content => content.type === category)
 }

 filteredContent.sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime())

 return filteredContent
 }

 isExclusiveContent(contentId: string): boolean {
 const exclusiveIds = [
 'exclusive-1', 'exclusive-2', 'exclusive-3', 
 '1', '2', '3', '4', '5', '6'
 ]
 return exclusiveIds.includes(contentId)
 }

 async getExclusiveContentById(contentId: string): Promise<ExclusiveContent | null> {
 const allContent = await this.getExclusiveContent()
 return allContent.find(content => content.id === contentId) || null
 }
}

export const exclusiveContentService = new ExclusiveContentService()