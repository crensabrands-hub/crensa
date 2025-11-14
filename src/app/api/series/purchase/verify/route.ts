import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { razorpayConfig } from "@/lib/razorpay/config";
import { seriesPurchasesRepository } from "@/lib/database/repositories/seriesPurchases";
import { transactionRepository } from "@/lib/database/repositories/transactions";
import { userRepository } from "@/lib/database/repositories/users";

export interface VerifySeriesPurchaseRequest {
 razorpay_order_id: string;
 razorpay_payment_id: string;
 razorpay_signature: string;
}

export interface VerifySeriesPurchaseResponse {
 success: boolean;
 paymentId: string;
 orderId: string;
 seriesId: string;
 hasAccess: boolean;
}

export async function POST(request: NextRequest) {
 try {

 const { userId } = await auth();
 if (!userId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 }

 const body: VerifySeriesPurchaseRequest = await request.json();
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

 const purchase = await seriesPurchasesRepository.findByRazorpayOrderId(
 razorpay_order_id
 );

 if (!purchase) {
 return NextResponse.json(
 { error: "Series purchase not found" },
 { status: 404 }
 );
 }

 if (purchase.userId !== user.id) {
 return NextResponse.json(
 { error: "Purchase does not belong to this user" },
 { status: 403 }
 );
 }

 if (purchase.status !== "pending") {
 return NextResponse.json(
 { error: "Purchase already processed" },
 { status: 400 }
 );
 }

 await seriesPurchasesRepository.update(purchase.id, {
 status: "completed",
 razorpayPaymentId: razorpay_payment_id,
 metadata: {
 ...(purchase.metadata || {}),
 verifiedAt: new Date().toISOString(),
 signature: razorpay_signature,
 paymentId: razorpay_payment_id,
 },
 });

 await transactionRepository.create({
 userId: user.id,
 type: "series_purchase",
 amount: purchase.purchasePrice,
 seriesId: purchase.seriesId,
 razorpayPaymentId: razorpay_payment_id,
 razorpayOrderId: razorpay_order_id,
 status: "completed",
 metadata: {
 seriesTitle: (purchase.metadata as any)?.seriesTitle || "Unknown Series",
 purchaseVerifiedAt: new Date().toISOString(),
 },
 });

 await seriesPurchasesRepository.updateProgress({
 seriesId: purchase.seriesId,
 userId: user.id,
 videosWatched: 0,
 totalVideos: 0, // Will be updated when user starts watching
 progressPercentage: "0.00",
 });

 const response: VerifySeriesPurchaseResponse = {
 success: true,
 paymentId: razorpay_payment_id,
 orderId: razorpay_order_id,
 seriesId: purchase.seriesId,
 hasAccess: true,
 };

 return NextResponse.json(response);
 } catch (error) {
 console.error("Error verifying series purchase:", error);

 return NextResponse.json(
 { error: "Series purchase verification failed" },
 { status: 500 }
 );
 }
}
