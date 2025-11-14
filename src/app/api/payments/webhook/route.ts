import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { razorpayConfig } from '@/lib/razorpay/config';

export async function POST(request: NextRequest) {
 try {
 const body = await request.text();
 const signature = request.headers.get('x-razorpay-signature');

 if (!signature) {
 console.error('Webhook: Missing signature');
 return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
 }

 const expectedSignature = crypto
 .createHmac('sha256', razorpayConfig.webhookSecret)
 .update(body)
 .digest('hex');

 if (signature !== expectedSignature) {
 console.error('Webhook: Invalid signature');
 return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
 }

 const event = JSON.parse(body);
 console.log('Webhook received:', event.event, event.payload?.payment?.entity?.id);

 switch (event.event) {
 case 'payment.captured':
 await handlePaymentCaptured(event.payload.payment.entity);
 break;
 
 case 'payment.failed':
 await handlePaymentFailed(event.payload.payment.entity);
 break;
 
 case 'payment.authorized':
 await handlePaymentAuthorized(event.payload.payment.entity);
 break;
 
 case 'order.paid':
 await handleOrderPaid(event.payload.order.entity);
 break;
 
 case 'refund.processed':
 await handleRefundProcessed(event.payload.refund.entity);
 break;
 
 default:
 console.log('Webhook: Unhandled event type:', event.event);
 }

 return NextResponse.json({ status: 'ok' });
 } catch (error) {
 console.error('Webhook error:', error);
 return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
 }
}

async function handlePaymentCaptured(payment: any) {
 console.log('Payment captured:', payment.id, 'Amount:', payment.amount);

}

async function handlePaymentFailed(payment: any) {
 console.log('Payment failed:', payment.id, 'Reason:', payment.error_reason);

}

async function handlePaymentAuthorized(payment: any) {
 console.log('Payment authorized:', payment.id);

}

async function handleOrderPaid(order: any) {
 console.log('Order paid:', order.id);

}

async function handleRefundProcessed(refund: any) {
 console.log('Refund processed:', refund.id, 'Amount:', refund.amount);

}