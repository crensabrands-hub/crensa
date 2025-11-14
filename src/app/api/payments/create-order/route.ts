import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRazorpayInstance } from '@/lib/razorpay/config';
import { nanoid } from 'nanoid';

export interface CreateOrderRequest {
 amount: number;
 currency?: 'INR';
 userId?: string;
 coins?: number;
 packageId?: string; // Optional: for coin package purchases
}

export interface CreateOrderResponse {
 orderId: string;
 amount: number;
 currency: string;
 keyId: string;
}

export async function POST(request: NextRequest) {
 try {

 const { userId } = await auth();
 if (!userId) {
 return NextResponse.json(
 { error: 'Unauthorized' },
 { status: 401 }
 );
 }

 const body: CreateOrderRequest = await request.json();
 const { amount, currency = 'INR', coins, packageId } = body;

 if (!amount || amount <= 0) {
 return NextResponse.json(
 { error: 'Invalid amount' },
 { status: 400 }
 );
 }

 if (coins !== undefined && coins <= 0) {
 return NextResponse.json(
 { error: 'Invalid coin amount' },
 { status: 400 }
 );
 }

 const amountInPaise = Math.round(amount * 100);

 const orderOptions = {
 amount: amountInPaise,
 currency,
 receipt: `receipt_${nanoid(10)}`,
 notes: {
 userId,
 coins: coins?.toString() || '',
 packageId: packageId || '',
 createdAt: new Date().toISOString(),
 },
 };

 const razorpayInstance = getRazorpayInstance();
 const order = await razorpayInstance.orders.create(orderOptions);

 const response: CreateOrderResponse = {
 orderId: order.id,
 amount: Number(order.amount),
 currency: order.currency,
 keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
 };

 return NextResponse.json(response);
 } catch (error) {
 console.error('Error creating Razorpay order:', error);

 if (error instanceof Error && error.message.includes('Razorpay instance not available')) {
 return NextResponse.json(
 { error: 'Payment service not available' },
 { status: 503 }
 );
 }
 
 return NextResponse.json(
 { error: 'Failed to create payment order' },
 { status: 500 }
 );
 }
}