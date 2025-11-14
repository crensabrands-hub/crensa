import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { razorpayConfig } from "@/lib/razorpay/config";
import { transactionRepository } from "@/lib/database/repositories/transactions";
import { userRepository } from "@/lib/database/repositories/users";
import { coinTransactionService } from "@/lib/services/coinTransactionService";
import { rupeesToCoins } from "@/lib/utils/coin-utils";

export interface VerifyPaymentRequest {
 razorpay_order_id: string;
 razorpay_payment_id: string;
 razorpay_signature: string;
}

export interface VerifyPaymentResponse {
 success: boolean;
 paymentId: string;
 orderId: string;
}

export async function POST(request: NextRequest) {
 try {

 const { userId } = await auth();
 if (!userId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body: VerifyPaymentRequest = await request.json();
 const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

 if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
 return NextResponse.json(
 { error: "Missing required payment verification fields" },
 { status: 400 }
 );
 }

 const expectedSignature = crypto
 .createHmac("sha256", razorpayConfig.keySecret)
 .update(`${razorpay_order_id}|${razorpay_payment_id}`)
 .digest("hex");

 const isSignatureValid = expectedSignature === razorpay_signature;

 if (!isSignatureValid) {
 return NextResponse.json(
 { error: "Invalid payment signature" },
 { status: 400 }
 );
 }

 const user = await userRepository.findByClerkId(userId);
 if (!user) {
 return NextResponse.json({ error: "User not found" }, { status: 404 });
 }

 const { transactions } = await transactionRepository.findMany(
 {
 userId: user.id,
 razorpayOrderId: razorpay_order_id,
 status: "pending",
 },
 { limit: 1 }
 );

 if (transactions.length === 0) {
 return NextResponse.json(
 { error: "Transaction not found" },
 { status: 404 }
 );
 }

 const transaction = transactions[0];

 await transactionRepository.update(transaction.id, {
 status: "completed",
 razorpayPaymentId: razorpay_payment_id,
 metadata: {
 ...(transaction.metadata || {}),
 verifiedAt: new Date().toISOString(),
 signature: razorpay_signature,
 },
 });

 const rupeeAmount = parseFloat(transaction.amount);
 const coinAmount = rupeesToCoins(rupeeAmount);

 const coinTransactionResult = await coinTransactionService.createCoinTransaction({
 userId: user.id,
 transactionType: 'purchase',
 coinAmount,
 rupeeAmount,
 paymentId: razorpay_payment_id,
 status: 'completed',
 description: `Coin purchase - ₹${rupeeAmount.toFixed(2)} (${coinAmount} coins)`,
 });

 if (!coinTransactionResult.success) {
 console.error('Failed to create coin transaction:', coinTransactionResult.error);
 return NextResponse.json(
 { error: "Failed to credit coins" },
 { status: 500 }
 );
 }

 const newCoinBalance = coinTransactionResult.newBalance || 0;

 const response: VerifyPaymentResponse = {
 success: true,
 paymentId: razorpay_payment_id,
 orderId: razorpay_order_id,
 };

 return NextResponse.json({
 ...response,
 newBalance: newCoinBalance,
 coinsAdded: coinAmount,
 rupeeAmount,
 });
 } catch (error) {
 console.error("Error verifying payment:", error);

 return NextResponse.json(
 { error: "Payment verification failed" },
 { status: 500 }
 );
 }
}
