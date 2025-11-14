import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories';

export async function POST(request: NextRequest) {
 try {
 const { userId } = await auth();
 const clerkUser = await currentUser();
 
 if (!userId || !clerkUser) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { role, email, username, displayName, bio, socialLinks } = await request.json();

 if (!role || !['creator', 'member'].includes(role)) {
 return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
 }

 if (!username) {
 return NextResponse.json({ error: 'Username is required' }, { status: 400 });
 }

 const existingUser = await userRepository.findByClerkId(userId);
 if (existingUser) {
 return NextResponse.json(
 { error: 'Profile already exists', user: existingUser },
 { status: 409 }
 );
 }

 const isUsernameAvailable = await userRepository.isUsernameAvailable(username);
 if (!isUsernameAvailable) {
 return NextResponse.json(
 { error: 'Username already taken' },
 { status: 400 }
 );
 }

 const newUser = await userRepository.create({
 clerkId: userId,
 email: email || clerkUser.emailAddresses[0]?.emailAddress || '',
 username,
 role: role as 'creator' | 'member',
 avatar: clerkUser.imageUrl || null
 });

 if (role === 'creator') {
 await userRepository.createCreatorProfile({
 userId: newUser.id,
 displayName: displayName || username,
 bio: bio || '',
 socialLinks: socialLinks || []
 });
 } else if (role === 'member') {
 await userRepository.createMemberProfile({
 userId: newUser.id
 });
 }

 const userWithProfile = await userRepository.findByClerkId(userId);
 
 return NextResponse.json(userWithProfile);
 } catch (error) {
 console.error('Error setting up profile:', error);
 return NextResponse.json({ 
 error: 'Internal server error',
 details: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
}