

export interface EmailTemplate {
 subject: string;
 htmlContent: string;
 textContent: string;
}

export interface EmailNotificationData {
 to: string;
 name: string;
 type: string;
 data: Record<string, any>;
}

export class EmailNotificationService {
 private apiKey: string | null;
 private fromEmail: string;
 private fromName: string;

 constructor() {
 this.apiKey = process.env.EMAIL_API_KEY || null;
 this.fromEmail = process.env.FROM_EMAIL || 'notifications@crensa.com';
 this.fromName = process.env.FROM_NAME || 'Crensa';
 }

 async sendEarningNotification(
 email: string,
 creatorName: string,
 data: {
 amount: number;
 videoTitle: string;
 totalEarnings: number;
 }
 ): Promise<boolean> {
 const template = this.getEarningEmailTemplate(creatorName, data);
 
 return await this.sendEmail({
 to: email,
 name: creatorName,
 type: 'earning',
 data,
 }, template);
 }

 async sendFollowerNotification(
 email: string,
 creatorName: string,
 data: {
 followerName: string;
 followerUsername: string;
 totalFollowers: number;
 }
 ): Promise<boolean> {
 const template = this.getFollowerEmailTemplate(creatorName, data);
 
 return await this.sendEmail({
 to: email,
 name: creatorName,
 type: 'follower',
 data,
 }, template);
 }

 async sendPaymentConfirmation(
 email: string,
 userName: string,
 data: {
 amount: number;
 type: 'credit_purchase' | 'membership_activation' | 'membership_upgrade';
 transactionId: string;
 newBalance?: number;
 }
 ): Promise<boolean> {
 const template = this.getPaymentEmailTemplate(userName, data);
 
 return await this.sendEmail({
 to: email,
 name: userName,
 type: 'payment',
 data,
 }, template);
 }

 async sendWelcomeEmail(
 email: string,
 userName: string,
 userRole: 'creator' | 'member'
 ): Promise<boolean> {
 const template = this.getWelcomeEmailTemplate(userName, userRole);
 
 return await this.sendEmail({
 to: email,
 name: userName,
 type: 'welcome',
 data: { userRole },
 }, template);
 }

 async sendSystemNotification(
 email: string,
 userName: string,
 data: {
 title: string;
 message: string;
 actionUrl?: string;
 actionText?: string;
 }
 ): Promise<boolean> {
 const template = this.getSystemEmailTemplate(userName, data);
 
 return await this.sendEmail({
 to: email,
 name: userName,
 type: 'system',
 data,
 }, template);
 }

 async sendBulkEmails(
 recipients: Array<{
 email: string;
 name: string;
 data?: Record<string, any>;
 }>,
 template: EmailTemplate
 ): Promise<boolean[]> {
 const results = await Promise.allSettled(
 recipients.map(recipient =>
 this.sendEmail({
 to: recipient.email,
 name: recipient.name,
 type: 'bulk',
 data: recipient.data || {},
 }, template)
 )
 );

 return results.map(result => 
 result.status === 'fulfilled' ? result.value : false
 );
 }

 private async sendEmail(
 recipient: EmailNotificationData,
 template: EmailTemplate
 ): Promise<boolean> {
 try {
 if (!this.apiKey) {
 console.warn('Email API key not configured, skipping email send');
 return false;
 }

 console.log('Sending email:', {
 to: recipient.to,
 subject: template.subject,
 type: recipient.type,
 });

 const response = await fetch('https://api.emailservice.com/send', {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${this.apiKey}`,
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 from: {
 email: this.fromEmail,
 name: this.fromName,
 },
 to: [{
 email: recipient.to,
 name: recipient.name,
 }],
 subject: template.subject,
 html: template.htmlContent,
 text: template.textContent,
 tags: [recipient.type, 'notification'],
 metadata: {
 type: recipient.type,
 userId: recipient.data.userId,
 },
 }),
 });

 return response.ok;
 } catch (error) {
 console.error('Failed to send email:', error);
 return false;
 }
 }

 private getEarningEmailTemplate(
 creatorName: string,
 data: { amount: number; videoTitle: string; totalEarnings: number }
 ): EmailTemplate {
 const subject = `💰 You earned ₹${data.amount} from "${data.videoTitle}"!`;
 
 const htmlContent = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <title>New Earning - Crensa</title>
 </head>
 <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
 <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
 <div style="text-align: center; margin-bottom: 30px;">
 <h1 style="color: #e91e63;">Crensa</h1>
 </div>
 
 <h2 style="color: #1a237e;">Congratulations, ${creatorName}! 🎉</h2>
 
 <p>Great news! You just earned <strong>₹${data.amount}</strong> from your video:</p>
 
 <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
 <h3 style="margin: 0; color: #1a237e;">"${data.videoTitle}"</h3>
 </div>
 
 <p>Your total earnings are now <strong>₹${data.totalEarnings}</strong>!</p>
 
 <div style="text-align: center; margin: 30px 0;">
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/creator/analytics" 
 style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
 View Analytics
 </a>
 </div>
 
 <p>Keep creating amazing content!</p>
 
 <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
 <p style="font-size: 12px; color: #666;">
 You received this email because you have earnings notifications enabled. 
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences">Update preferences</a>
 </p>
 </div>
 </body>
 </html>
 `;

 const textContent = `
 Congratulations, ${creatorName}!
 
 You just earned ₹${data.amount} from your video "${data.videoTitle}".
 Your total earnings are now ₹${data.totalEarnings}!
 
 View your analytics: ${process.env.NEXT_PUBLIC_BASE_URL}/creator/analytics
 
 Keep creating amazing content!
 `;

 return { subject, htmlContent, textContent };
 }

 private getFollowerEmailTemplate(
 creatorName: string,
 data: { followerName: string; followerUsername: string; totalFollowers: number }
 ): EmailTemplate {
 const subject = `👤 ${data.followerName} started following you!`;
 
 const htmlContent = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <title>New Follower - Crensa</title>
 </head>
 <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
 <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
 <div style="text-align: center; margin-bottom: 30px;">
 <h1 style="color: #e91e63;">Crensa</h1>
 </div>
 
 <h2 style="color: #1a237e;">You have a new follower! 🎉</h2>
 
 <p>Hi ${creatorName},</p>
 
 <p><strong>${data.followerName}</strong> (@${data.followerUsername}) started following you!</p>
 
 <p>You now have <strong>${data.totalFollowers}</strong> followers.</p>
 
 <div style="text-align: center; margin: 30px 0;">
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/creator/analytics?tab=followers" 
 style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
 View Followers
 </a>
 </div>
 
 <p>Keep creating great content to grow your audience!</p>
 
 <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
 <p style="font-size: 12px; color: #666;">
 You received this email because you have follower notifications enabled. 
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences">Update preferences</a>
 </p>
 </div>
 </body>
 </html>
 `;

 const textContent = `
 You have a new follower!
 
 ${data.followerName} (@${data.followerUsername}) started following you!
 You now have ${data.totalFollowers} followers.
 
 View your followers: ${process.env.NEXT_PUBLIC_BASE_URL}/creator/analytics?tab=followers
 
 Keep creating great content to grow your audience!
 `;

 return { subject, htmlContent, textContent };
 }

 private getPaymentEmailTemplate(
 userName: string,
 data: { amount: number; type: string; transactionId: string; newBalance?: number }
 ): EmailTemplate {
 const getTypeText = (type: string) => {
 switch (type) {
 case 'credit_purchase': return 'Credit Purchase';
 case 'membership_activation': return 'Membership Activation';
 case 'membership_upgrade': return 'Membership Upgrade';
 default: return 'Payment';
 }
 };

 const subject = `✅ ${getTypeText(data.type)} Confirmed - ₹${data.amount}`;
 
 const htmlContent = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <title>Payment Confirmation - Crensa</title>
 </head>
 <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
 <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
 <div style="text-align: center; margin-bottom: 30px;">
 <h1 style="color: #e91e63;">Crensa</h1>
 </div>
 
 <h2 style="color: #1a237e;">Payment Confirmed! ✅</h2>
 
 <p>Hi ${userName},</p>
 
 <p>Your payment has been successfully processed.</p>
 
 <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
 <h3 style="margin: 0 0 10px 0; color: #1a237e;">Payment Details</h3>
 <p style="margin: 5px 0;"><strong>Type:</strong> ${getTypeText(data.type)}</p>
 <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${data.amount}</p>
 <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
 ${data.newBalance ? `<p style="margin: 5px 0;"><strong>New Balance:</strong> ₹${data.newBalance}</p>` : ''}
 </div>
 
 <div style="text-align: center; margin: 30px 0;">
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/wallet" 
 style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
 View Wallet
 </a>
 </div>
 
 <p>Thank you for using Crensa!</p>
 
 <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
 <p style="font-size: 12px; color: #666;">
 You received this email because you have payment notifications enabled. 
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences">Update preferences</a>
 </p>
 </div>
 </body>
 </html>
 `;

 const textContent = `
 Payment Confirmed!
 
 Hi ${userName},
 
 Your payment has been successfully processed.
 
 Payment Details:
 - Type: ${getTypeText(data.type)}
 - Amount: ₹${data.amount}
 - Transaction ID: ${data.transactionId}
 ${data.newBalance ? `- New Balance: ₹${data.newBalance}` : ''}
 
 View your wallet: ${process.env.NEXT_PUBLIC_BASE_URL}/wallet
 
 Thank you for using Crensa!
 `;

 return { subject, htmlContent, textContent };
 }

 private getWelcomeEmailTemplate(
 userName: string,
 userRole: 'creator' | 'member'
 ): EmailTemplate {
 const subject = `Welcome to Crensa! 🎉`;
 const isCreator = userRole === 'creator';
 
 const htmlContent = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <title>Welcome to Crensa</title>
 </head>
 <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
 <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
 <div style="text-align: center; margin-bottom: 30px;">
 <h1 style="color: #e91e63;">Crensa</h1>
 </div>
 
 <h2 style="color: #1a237e;">Welcome to Crensa! 🎉</h2>
 
 <p>Hi ${userName},</p>
 
 <p>Welcome to Crensa, the platform where ${isCreator ? 'creators monetize their content' : 'viewers discover amazing content'}!</p>
 
 ${isCreator ? `
 <p>As a creator, you can:</p>
 <ul>
 <li>Upload and monetize your videos</li>
 <li>Set your own pricing</li>
 <li>Track your earnings and analytics</li>
 <li>Build your audience</li>
 </ul>
 
 <div style="text-align: center; margin: 30px 0;">
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/creator/upload" 
 style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
 Upload Your First Video
 </a>
 </div>
 ` : `
 <p>As a member, you can:</p>
 <ul>
 <li>Discover amazing content from creators</li>
 <li>Support your favorite creators</li>
 <li>Access exclusive content with membership</li>
 <li>Enjoy a personalized viewing experience</li>
 </ul>
 
 <div style="text-align: center; margin: 30px 0;">
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
 style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
 Start Exploring
 </a>
 </div>
 `}
 
 <p>If you have any questions, feel free to reach out to our support team.</p>
 
 <p>Happy ${isCreator ? 'creating' : 'viewing'}!</p>
 <p>The Crensa Team</p>
 
 <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
 <p style="font-size: 12px; color: #666;">
 You received this email because you signed up for Crensa. 
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences">Update preferences</a>
 </p>
 </div>
 </body>
 </html>
 `;

 const textContent = `
 Welcome to Crensa!
 
 Hi ${userName},
 
 Welcome to Crensa, the platform where ${isCreator ? 'creators monetize their content' : 'viewers discover amazing content'}!
 
 ${isCreator ? `
 As a creator, you can:
 - Upload and monetize your videos
 - Set your own pricing
 - Track your earnings and analytics
 - Build your audience
 
 Upload your first video: ${process.env.NEXT_PUBLIC_BASE_URL}/creator/upload
 ` : `
 As a member, you can:
 - Discover amazing content from creators
 - Support your favorite creators
 - Access exclusive content with membership
 - Enjoy a personalized viewing experience
 
 Start exploring: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard
 `}
 
 If you have any questions, feel free to reach out to our support team.
 
 Happy ${isCreator ? 'creating' : 'viewing'}!
 The Crensa Team
 `;

 return { subject, htmlContent, textContent };
 }

 private getSystemEmailTemplate(
 userName: string,
 data: { title: string; message: string; actionUrl?: string; actionText?: string }
 ): EmailTemplate {
 const subject = data.title;
 
 const htmlContent = `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <title>${data.title} - Crensa</title>
 </head>
 <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
 <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
 <div style="text-align: center; margin-bottom: 30px;">
 <h1 style="color: #e91e63;">Crensa</h1>
 </div>
 
 <h2 style="color: #1a237e;">${data.title}</h2>
 
 <p>Hi ${userName},</p>
 
 <p>${data.message}</p>
 
 ${data.actionUrl && data.actionText ? `
 <div style="text-align: center; margin: 30px 0;">
 <a href="${data.actionUrl}" 
 style="background: #e91e63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
 ${data.actionText}
 </a>
 </div>
 ` : ''}
 
 <p>Best regards,<br>The Crensa Team</p>
 
 <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
 <p style="font-size: 12px; color: #666;">
 You received this email because you have system notifications enabled. 
 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/notifications/preferences">Update preferences</a>
 </p>
 </div>
 </body>
 </html>
 `;

 const textContent = `
 ${data.title}
 
 Hi ${userName},
 
 ${data.message}
 
 ${data.actionUrl && data.actionText ? `${data.actionText}: ${data.actionUrl}` : ''}
 
 Best regards,
 The Crensa Team
 `;

 return { subject, htmlContent, textContent };
 }
}

export const emailNotificationService = new EmailNotificationService();