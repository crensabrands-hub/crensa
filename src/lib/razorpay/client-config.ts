
export const razorpayClientConfig = {
 key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
 currency: "INR" as const,
 name: "Crensa",
 description: "Coin Purchase",
 theme: {
 color: "#8B5CF6", // Crensa purple color
 },
};

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
 throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is required");
}
