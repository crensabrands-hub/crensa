

import { db } from '../database/connection';
import { 
 coinTransactions, 
 users,
 creatorProfiles,
 type CoinTransaction,
 type NewCoinTransaction,
 type CoinTransactionType,
 type CoinTransactionStatus,
 type CoinContentType
} from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { 
 validateCoinBalance, 
 hasSufficientCoins,
 getInsufficientBalanceMessage 
} from '../utils/coin-utils';

export interface CreateCoinTransactionParams {
 userId: string;
 transactionType: CoinTransactionType;
 coinAmount: number;
 rupeeAmount?: number;
 relatedContentType?: CoinContentType;
 relatedContentId?: string;
 paymentId?: string;
 status?: CoinTransactionStatus;
 description: string;
}

export interface CoinTransactionResult {
 success: boolean;
 transaction?: CoinTransaction;
 newBalance?: number;
 error?: string;
}

export interface CoinBalanceInfo {
 balance: number;
 totalPurchased: number;
 totalSpent: number;
 lastUpdated: Date;
}

export interface UpdateBalanceParams {
 userId: string;
 amount: number;
 operation: 'add' | 'subtract';
}

export interface InsufficientCoinsError {
 required: number;
 available: number;
 shortfall: number;
 message: string;
}

export class CoinTransactionService {
 
 async createCoinTransaction(
 params: CreateCoinTransactionParams
 ): Promise<CoinTransactionResult> {
 try {

 if (params.coinAmount <= 0) {
 return {
 success: false,
 error: 'Coin amount must be greater than zero'
 };
 }

 if (params.transactionType === 'spend') {
 const balance = await this.getUserCoinBalance(params.userId);
 if (!hasSufficientCoins(balance, params.coinAmount)) {
 return {
 success: false,
 error: getInsufficientBalanceMessage(balance, params.coinAmount)
 };
 }
 }

 const result = await db.transaction(async (tx) => {

 const transactionData: NewCoinTransaction = {
 userId: params.userId,
 transactionType: params.transactionType,
 coinAmount: params.coinAmount,
 rupeeAmount: params.rupeeAmount?.toString(),
 relatedContentType: params.relatedContentType,
 relatedContentId: params.relatedContentId,
 paymentId: params.paymentId,
 status: params.status || 'completed',
 description: params.description,
 createdAt: new Date(),
 updatedAt: new Date()
 };

 const [transaction] = await tx
 .insert(coinTransactions)
 .values(transactionData)
 .returning();

 let newBalance: number;
 
 switch (params.transactionType) {
 case 'purchase':

 newBalance = await this.updateUserCoinBalance(
 { userId: params.userId, amount: params.coinAmount, operation: 'add' },
 tx
 );

 await tx
 .update(users)
 .set({ 
 totalCoinsPurchased: sql`${users.totalCoinsPurchased} + ${params.coinAmount}`,
 updatedAt: new Date()
 })
 .where(eq(users.id, params.userId));
 break;

 case 'spend':

 newBalance = await this.updateUserCoinBalance(
 { userId: params.userId, amount: params.coinAmount, operation: 'subtract' },
 tx
 );

 await tx
 .update(users)
 .set({ 
 totalCoinsSpent: sql`${users.totalCoinsSpent} + ${params.coinAmount}`,
 updatedAt: new Date()
 })
 .where(eq(users.id, params.userId));
 break;

 case 'earn':

 newBalance = await this.getUserCoinBalance(params.userId);
 break;

 case 'refund':

 newBalance = await this.updateUserCoinBalance(
 { userId: params.userId, amount: params.coinAmount, operation: 'add' },
 tx
 );
 break;

 default:
 throw new Error(`Unknown transaction type: ${params.transactionType}`);
 }

 return { transaction, newBalance };
 });

 console.log('[CoinTransaction] Created:', {
 transactionId: result.transaction.id,
 userId: params.userId,
 type: params.transactionType,
 amount: params.coinAmount,
 newBalance: result.newBalance
 });

 return {
 success: true,
 transaction: result.transaction,
 newBalance: result.newBalance
 };

 } catch (error) {
 console.error('[CoinTransaction] Error creating transaction:', error);
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to create coin transaction'
 };
 }
 }

 async getUserCoinBalance(userId: string): Promise<number> {
 try {
 const result = await db
 .select({ coinBalance: users.coinBalance })
 .from(users)
 .where(eq(users.id, userId))
 .limit(1);

 if (result.length === 0) {
 throw new Error('User not found');
 }

 return result[0].coinBalance || 0;
 } catch (error) {
 console.error('[CoinTransaction] Error getting user balance:', error);
 return 0;
 }
 }

 async getCoinBalanceInfo(userId: string): Promise<CoinBalanceInfo> {
 try {
 const result = await db
 .select({
 coinBalance: users.coinBalance,
 totalCoinsPurchased: users.totalCoinsPurchased,
 totalCoinsSpent: users.totalCoinsSpent,
 updatedAt: users.updatedAt
 })
 .from(users)
 .where(eq(users.id, userId))
 .limit(1);

 if (result.length === 0) {
 throw new Error('User not found');
 }

 const user = result[0];
 return {
 balance: user.coinBalance || 0,
 totalPurchased: user.totalCoinsPurchased || 0,
 totalSpent: user.totalCoinsSpent || 0,
 lastUpdated: user.updatedAt
 };
 } catch (error) {
 console.error('[CoinTransaction] Error getting balance info:', error);
 throw error;
 }
 }

 async updateUserCoinBalance(
 params: UpdateBalanceParams,
 tx?: any
 ): Promise<number> {
 const dbInstance = tx || db;

 try {

 const currentBalanceResult = await dbInstance
 .select({ coinBalance: users.coinBalance })
 .from(users)
 .where(eq(users.id, params.userId))
 .limit(1);

 if (currentBalanceResult.length === 0) {
 throw new Error('User not found');
 }

 const currentBalance = currentBalanceResult[0].coinBalance || 0;
 let newBalance: number;

 if (params.operation === 'add') {
 newBalance = currentBalance + params.amount;
 } else if (params.operation === 'subtract') {
 newBalance = currentBalance - params.amount;

 if (newBalance < 0) {
 throw new Error('Insufficient coin balance');
 }
 } else {
 throw new Error(`Invalid operation: ${params.operation}`);
 }

 if (!validateCoinBalance(newBalance)) {
 throw new Error('Invalid coin balance after operation');
 }

 await dbInstance
 .update(users)
 .set({ 
 coinBalance: newBalance,
 updatedAt: new Date()
 })
 .where(eq(users.id, params.userId));

 console.log('[CoinTransaction] Balance updated:', {
 userId: params.userId,
 operation: params.operation,
 amount: params.amount,
 oldBalance: currentBalance,
 newBalance: newBalance
 });

 return newBalance;

 } catch (error) {
 console.error('[CoinTransaction] Error updating balance:', error);
 throw error;
 }
 }

 async getUserTransactionHistory(
 userId: string,
 options: {
 limit?: number;
 offset?: number;
 transactionType?: CoinTransactionType;
 status?: CoinTransactionStatus;
 } = {}
 ): Promise<{ transactions: CoinTransaction[]; total: number }> {
 try {
 const { limit = 20, offset = 0, transactionType, status } = options;

 const conditions = [eq(coinTransactions.userId, userId)];
 
 if (transactionType) {
 conditions.push(eq(coinTransactions.transactionType, transactionType));
 }
 
 if (status) {
 conditions.push(eq(coinTransactions.status, status));
 }

 const transactions = await db
 .select()
 .from(coinTransactions)
 .where(and(...conditions))
 .orderBy(desc(coinTransactions.createdAt))
 .limit(limit)
 .offset(offset);

 const countResult = await db
 .select({ count: sql<number>`count(*)` })
 .from(coinTransactions)
 .where(and(...conditions));

 const total = Number(countResult[0]?.count || 0);

 return { transactions, total };
 } catch (error) {
 console.error('[CoinTransaction] Error getting transaction history:', error);
 return { transactions: [], total: 0 };
 }
 }

 async getTransactionById(transactionId: string): Promise<CoinTransaction | null> {
 try {
 const result = await db
 .select()
 .from(coinTransactions)
 .where(eq(coinTransactions.id, transactionId))
 .limit(1);

 return result.length > 0 ? result[0] : null;
 } catch (error) {
 console.error('[CoinTransaction] Error getting transaction:', error);
 return null;
 }
 }

 async getTransactionByPaymentId(paymentId: string): Promise<CoinTransaction | null> {
 try {
 const result = await db
 .select()
 .from(coinTransactions)
 .where(eq(coinTransactions.paymentId, paymentId))
 .limit(1);

 return result.length > 0 ? result[0] : null;
 } catch (error) {
 console.error('[CoinTransaction] Error getting transaction by payment ID:', error);
 return null;
 }
 }

 async updateTransactionStatus(
 transactionId: string,
 status: CoinTransactionStatus
 ): Promise<boolean> {
 try {
 await db
 .update(coinTransactions)
 .set({ 
 status,
 updatedAt: new Date()
 })
 .where(eq(coinTransactions.id, transactionId));

 console.log('[CoinTransaction] Status updated:', {
 transactionId,
 newStatus: status
 });

 return true;
 } catch (error) {
 console.error('[CoinTransaction] Error updating transaction status:', error);
 return false;
 }
 }

 async checkSufficientCoins(
 userId: string,
 requiredCoins: number
 ): Promise<{
 sufficient: boolean;
 balance: number;
 error?: InsufficientCoinsError;
 }> {
 try {
 const balance = await this.getUserCoinBalance(userId);

 if (hasSufficientCoins(balance, requiredCoins)) {
 return { sufficient: true, balance };
 }

 const shortfall = requiredCoins - balance;
 return {
 sufficient: false,
 balance,
 error: {
 required: requiredCoins,
 available: balance,
 shortfall,
 message: getInsufficientBalanceMessage(balance, requiredCoins)
 }
 };
 } catch (error) {
 console.error('[CoinTransaction] Error checking sufficient coins:', error);
 return {
 sufficient: false,
 balance: 0,
 error: {
 required: requiredCoins,
 available: 0,
 shortfall: requiredCoins,
 message: 'Failed to check coin balance'
 }
 };
 }
 }

 async recordCreatorEarning(
 creatorId: string,
 coinAmount: number,
 relatedContentType: CoinContentType,
 relatedContentId: string,
 description: string
 ): Promise<CoinTransactionResult> {
 try {

 const result = await db.transaction(async (tx) => {

 const transactionData: NewCoinTransaction = {
 userId: creatorId,
 transactionType: 'earn',
 coinAmount,
 relatedContentType,
 relatedContentId,
 status: 'completed',
 description,
 createdAt: new Date(),
 updatedAt: new Date()
 };

 const [transaction] = await tx
 .insert(coinTransactions)
 .values(transactionData)
 .returning();

 await tx
 .update(creatorProfiles)
 .set({
 coinBalance: sql`${creatorProfiles.coinBalance} + ${coinAmount}`,
 totalCoinsEarned: sql`${creatorProfiles.totalCoinsEarned} + ${coinAmount}`,
 updatedAt: new Date()
 })
 .where(eq(creatorProfiles.userId, creatorId));

 const balanceResult = await tx
 .select({ coinBalance: creatorProfiles.coinBalance })
 .from(creatorProfiles)
 .where(eq(creatorProfiles.userId, creatorId))
 .limit(1);

 const newBalance = balanceResult[0]?.coinBalance || 0;

 return { transaction, newBalance };
 });

 console.log('[CoinTransaction] Creator earning recorded:', {
 creatorId,
 amount: coinAmount,
 contentType: relatedContentType,
 contentId: relatedContentId
 });

 return {
 success: true,
 transaction: result.transaction,
 newBalance: result.newBalance
 };
 } catch (error) {
 console.error('[CoinTransaction] Error recording creator earning:', error);
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Failed to record creator earning'
 };
 }
 }

 async getCreatorCoinBalance(creatorId: string): Promise<number> {
 try {
 const result = await db
 .select({ coinBalance: creatorProfiles.coinBalance })
 .from(creatorProfiles)
 .where(eq(creatorProfiles.userId, creatorId))
 .limit(1);

 return result[0]?.coinBalance || 0;
 } catch (error) {
 console.error('[CoinTransaction] Error getting creator balance:', error);
 return 0;
 }
 }
}

export const coinTransactionService = new CoinTransactionService();
