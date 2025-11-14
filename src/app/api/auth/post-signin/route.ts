import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userRepository } from '@/lib/database/repositories';

export async function GET(request: NextRequest) {
 try {
 const { userId } = await auth();
 
 if (!userId) {

 return NextResponse.redirect(new URL('/sign-in', request.url));
 }

 const user = await userRepository.findByClerkId(userId);
 
 if (!user) {

 console.warn('User signed in but no profile found, redirecting to sign-up');
 return NextResponse.redirect(new URL('/sign-up', request.url));
 }

 const dashboardUrl = user.role === 'creator' 
 ? '/creator/dashboard' 
 : '/dashboard';
 
 return NextResponse.redirect(new URL(dashboardUrl, request.url));
 
 } catch (error) {
 console.error('Error in post-signin handler:', error);

 return NextResponse.redirect(new URL('/dashboard', request.url));
 }
}
