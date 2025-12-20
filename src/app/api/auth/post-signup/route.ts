import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 const clerkUser = await currentUser();
 
 if (!userId || !clerkUser) {

 return NextResponse.redirect(new URL('/sign-in', request.url));
 }

 const searchParams = request.nextUrl.searchParams;
 let role = searchParams.get('role') || 'member'; // Default to member role

 if (!['creator', 'member'].includes(role)) {
 // If invalid role, default to member
 role = 'member';
 }

 const existingUser = await userRepository.findByClerkId(userId);
 
 if (existingUser) {

 const dashboardUrl = existingUser.role === 'creator' 
 ? '/creator/dashboard' 
 : '/dashboard';
 return NextResponse.redirect(new URL(dashboardUrl, request.url));
 }

 const username = 
 clerkUser.username || 
 clerkUser.firstName?.toLowerCase() || 
 `user_${Date.now()}`;

 let finalUsername = username;
 let isAvailable = await userRepository.isUsernameAvailable(finalUsername);
 let suffix = 1;
 
 while (!isAvailable) {
 finalUsername = `${username}${suffix}`;
 isAvailable = await userRepository.isUsernameAvailable(finalUsername);
 suffix++;
 }

 const newUser = await userRepository.create({
 clerkId: userId,
 email: clerkUser.emailAddresses[0]?.emailAddress || '',
 username: finalUsername,
 role: role as 'creator' | 'member',
 avatar: clerkUser.imageUrl || null
 });

 if (role === 'creator') {
 await userRepository.createCreatorProfile({
 userId: newUser.id,
 displayName: clerkUser.firstName || finalUsername,
 bio: '',
 socialLinks: []
 });
 } else {
 await userRepository.createMemberProfile({
 userId: newUser.id
 });
 }

 const dashboardUrl = role === 'creator' ? '/creator/dashboard' : '/dashboard';
 return NextResponse.redirect(new URL(dashboardUrl, request.url));
 
 } catch (error) {
 console.error('Error in post-signup handler:', error);

 return NextResponse.redirect(new URL('/dashboard', request.url));
 }
}
