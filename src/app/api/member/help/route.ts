import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

interface HelpRequestData {
 subject: string;
 category: string;
 message: string;
 priority: 'low' | 'medium' | 'high' | 'urgent';
 userProfile: {
 id: string;
 username: string;
 email: string;
 clerkId: string;
 };
}

const createTransporter = () => {

 if (process.env.NODE_ENV === 'development') {

 return nodemailer.createTransport({
 host: 'smtp.ethereal.email',
 port: 587,
 secure: false,
 auth: {
 user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
 pass: process.env.EMAIL_PASS || 'ethereal.pass'
 }
 });
 }

 return nodemailer.createTransport({
 service: 'gmail',
 auth: {
 user: process.env.ADMIN_EMAIL_USER,
 pass: process.env.ADMIN_EMAIL_PASS, // Use app password for Gmail
 },
 });

};

const getPriorityEmoji = (priority: string) => {
 switch (priority) {
 case 'urgent': return '🚨';
 case 'high': return '⚠️';
 case 'medium': return '📋';
 case 'low': return '💭';
 default: return '📋';
 }
};

const getCategoryEmoji = (category: string) => {
 switch (category) {
 case 'general': return '❓';
 case 'membership': return '⭐';
 case 'technical': return '🔧';
 case 'content': return '📺';
 case 'account': return '👤';
 case 'other': return '📋';
 default: return '📋';
 }
};

export async function POST(request: NextRequest) {
 try {

 const { userId } = await auth();
 if (!userId) {
 return NextResponse.json(
 { success: false, error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const data: HelpRequestData = await request.json();

 if (!data.subject?.trim() || !data.category || !data.message?.trim()) {
 return NextResponse.json(
 { success: false, error: 'Missing required fields' },
 { status: 400 }
 );
 }

 if (data.message.trim().length < 20) {
 return NextResponse.json(
 { success: false, error: 'Message must be at least 20 characters long' },
 { status: 400 }
 );
 }

 if (data.subject.trim().length < 5) {
 return NextResponse.json(
 { success: false, error: 'Subject must be at least 5 characters long' },
 { status: 400 }
 );
 }

 if (data.userProfile.clerkId !== userId) {
 return NextResponse.json(
 { success: false, error: 'User mismatch' },
 { status: 403 }
 );
 }

 const transporter = createTransporter();

 const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'admin@crensa.com';

 const emailSubject = `${getPriorityEmoji(data.priority)} Member Help Request: ${data.subject}`;
 
 const emailHtml = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <title>Member Help Request</title>
 <style>
 body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
 .container { max-width: 600px; margin: 0 auto; padding: 20px; }
 .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
 .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
 .footer { background: #64748b; color: white; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; }
 .priority { padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
 .priority-urgent { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
 .priority-high { background: #fed7aa; color: #ea580c; border: 1px solid #fdba74; }
 .priority-medium { background: #dbeafe; color: #2563eb; border: 1px solid #93c5fd; }
 .priority-low { background: #dcfce7; color: #16a34a; border: 1px solid #86efac; }
 .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
 .info-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #1e3a8a; }
 .message-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0; }
 .label { font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
 </style>
 </head>
 <body>
 <div class="container">
 <div class="header">
 <h1>👤 Member Help Request</h1>
 <p>New support request from Crensa Member Platform</p>
 </div>
 
 <div class="content">
 <div class="priority priority-${data.priority}">
 ${getPriorityEmoji(data.priority)} ${data.priority.toUpperCase()} PRIORITY
 </div>
 
 <h2>${getCategoryEmoji(data.category)} ${data.subject}</h2>
 
 <div class="info-grid">
 <div class="info-item">
 <div class="label">Member Details</div>
 <p><strong>Username:</strong> ${data.userProfile.username}</p>
 <p><strong>Email:</strong> ${data.userProfile.email}</p>
 <p><strong>User ID:</strong> ${data.userProfile.id}</p>
 <p><strong>Clerk ID:</strong> ${data.userProfile.clerkId}</p>
 </div>
 
 <div class="info-item">
 <div class="label">Request Details</div>
 <p><strong>Category:</strong> ${data.category}</p>
 <p><strong>Priority:</strong> ${data.priority}</p>
 <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
 </div>
 </div>
 
 <div class="message-box">
 <div class="label">Message:</div>
 <p style="white-space: pre-wrap;">${data.message}</p>
 </div>
 
 <div style="background: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
 <strong>Response Time Target:</strong>
 ${data.priority === 'urgent' ? 'Within 2 hours' : 
 data.priority === 'high' ? 'Within 8 hours' :
 data.priority === 'medium' ? 'Within 24 hours' : 'Within 48 hours'}
 </div>
 </div>
 
 <div class="footer">
 <p>This email was sent from the Crensa Member Help System.</p>
 <p>Please respond directly to this email to assist the member.</p>
 <p>Timestamp: ${new Date().toISOString()}</p>
 </div>
 </div>
 </body>
 </html>
 `;

 const emailText = `
Member Help Request - ${data.priority.toUpperCase()} PRIORITY

Subject: ${data.subject}
Category: ${data.category}
Priority: ${data.priority}

Member Details:
- Username: ${data.userProfile.username}
- Email: ${data.userProfile.email}
- User ID: ${data.userProfile.id}
- Clerk ID: ${data.userProfile.clerkId}

Message:
${data.message}

Submitted: ${new Date().toLocaleString()}
Response Time Target: ${data.priority === 'urgent' ? 'Within 2 hours' : 
 data.priority === 'high' ? 'Within 8 hours' :
 data.priority === 'medium' ? 'Within 24 hours' : 'Within 48 hours'}
 `;

 const mailOptions = {
 from: `"Crensa Member Platform" <${process.env.ADMIN_EMAIL_USER || 'noreply@crensa.com'}>`,
 to: adminEmail,
 replyTo: data.userProfile.email,
 subject: emailSubject,
 text: emailText,
 html: emailHtml,
 headers: {
 'X-Priority': data.priority === 'urgent' ? '1' : data.priority === 'high' ? '2' : '3',
 'X-Member-ID': data.userProfile.id,
 'X-Help-Category': data.category,
 }
 };

 if (process.env.NODE_ENV === 'development') {

 console.log('=== MEMBER HELP REQUEST (DEV MODE) ===');
 console.log('To:', adminEmail);
 console.log('Subject:', emailSubject);
 console.log('From Member:', data.userProfile.username, `(${data.userProfile.email})`);
 console.log('Category:', data.category);
 console.log('Priority:', data.priority);
 console.log('Message:', data.message);
 console.log('=====================================');

 try {
 const info = await transporter.sendMail(mailOptions);
 console.log('Test email sent:', info.messageId);
 if (nodemailer.getTestMessageUrl(info)) {
 console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
 }
 } catch (emailError) {
 console.log('Email sending failed (dev mode):', emailError);

 }
 } else {

 await transporter.sendMail(mailOptions);
 }

 console.log(`Member help request submitted by ${data.userProfile.username} (${data.userProfile.email}): ${data.subject}`);

 return NextResponse.json({
 success: true,
 message: 'Help request sent successfully',
 ticketId: `MEMBER-${Date.now()}-${data.userProfile.id.slice(-4)}` // Simple ticket ID
 });

 } catch (error) {
 console.error('Error processing member help request:', error);
 
 return NextResponse.json(
 { 
 success: false, 
 error: 'Failed to send help request. Please try again later.' 
 },
 { status: 500 }
 );
 }
}