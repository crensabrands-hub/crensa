'use client'

export interface ErrorReport {
 id: string
 timestamp: Date
 error: Error | string
 errorInfo?: any
 context: {
 userId?: string
 userRole?: string
 page?: string
 component?: string
 action?: string
 userAgent?: string
 url?: string
 }
 severity: 'low' | 'medium' | 'high' | 'critical'
 tags?: string[]
 metadata?: Record<string, any>
}

export interface RetryConfig {
 maxRetries: number
 baseDelay: number
 maxDelay: number
 backoffMultiplier: number
 retryableErrors: string[]
}

class ErrorReportingService {
 private reports: ErrorReport[] = []
 private isOnline: boolean = true
 private pendingReports: ErrorReport[] = []

 constructor() {
 if (typeof window !== 'undefined') {
 this.isOnline = navigator.onLine
 this.setupNetworkListeners()
 this.setupUnhandledErrorCatching()
 }
 }

 private setupNetworkListeners() {
 window.addEventListener('online', () => {
 this.isOnline = true
 this.flushPendingReports()
 })

 window.addEventListener('offline', () => {
 this.isOnline = false
 })
 }

 private setupUnhandledErrorCatching() {

 window.addEventListener('error', (event) => {
 this.captureError(event.error || event.message, {
 context: {
 page: window.location.pathname,
 url: window.location.href,
 userAgent: navigator.userAgent
 },
 severity: 'high',
 tags: ['unhandled', 'javascript'],
 metadata: {
 filename: event.filename,
 lineno: event.lineno,
 colno: event.colno
 }
 })
 })

 window.addEventListener('unhandledrejection', (event) => {
 this.captureError(event.reason, {
 context: {
 page: window.location.pathname,
 url: window.location.href,
 userAgent: navigator.userAgent
 },
 severity: 'high',
 tags: ['unhandled', 'promise'],
 metadata: {
 type: 'unhandledrejection'
 }
 })
 })
 }

 captureError(
 error: Error | string,
 options: Partial<Omit<ErrorReport, 'id' | 'timestamp' | 'error'>> = {}
 ): string {
 const errorReport: ErrorReport = {
 id: this.generateId(),
 timestamp: new Date(),
 error,
 context: {
 page: typeof window !== 'undefined' ? window.location.pathname : undefined,
 url: typeof window !== 'undefined' ? window.location.href : undefined,
 userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
 ...options.context
 },
 severity: options.severity || 'medium',
 tags: options.tags || [],
 metadata: options.metadata || {},
 errorInfo: options.errorInfo
 }

 this.reports.push(errorReport)

 if (process.env.NODE_ENV === 'development') {
 console.error('Error captured:', errorReport)
 }

 if (this.isOnline) {
 this.sendReport(errorReport)
 } else {
 this.pendingReports.push(errorReport)
 }

 return errorReport.id
 }

 captureException(error: Error, context?: Partial<ErrorReport['context']>): string {
 return this.captureError(error, {
 context,
 severity: 'high',
 tags: ['exception'],
 metadata: {
 stack: error.stack,
 name: error.name
 }
 })
 }

 captureMessage(message: string, level: ErrorReport['severity'] = 'medium', context?: Partial<ErrorReport['context']>): string {
 return this.captureError(message, {
 context,
 severity: level,
 tags: ['message']
 })
 }

 private async sendReport(report: ErrorReport) {
 try {

 if (process.env.NODE_ENV === 'production') {

 }

 this.storeReportLocally(report)
 } catch (error) {
 console.error('Failed to send error report:', error)
 this.pendingReports.push(report)
 }
 }

 private storeReportLocally(report: ErrorReport) {
 try {
 const stored = localStorage.getItem('error_reports') || '[]'
 const reports = JSON.parse(stored)
 reports.push({
 ...report,
 timestamp: report.timestamp.toISOString()
 })

 if (reports.length > 50) {
 reports.splice(0, reports.length - 50)
 }
 
 localStorage.setItem('error_reports', JSON.stringify(reports))
 } catch (error) {
 console.error('Failed to store error report locally:', error)
 }
 }

 private async flushPendingReports() {
 const reports = [...this.pendingReports]
 this.pendingReports = []

 for (const report of reports) {
 await this.sendReport(report)
 }
 }

 getReports(): ErrorReport[] {
 return [...this.reports]
 }

 getStoredReports(): ErrorReport[] {
 try {
 const stored = localStorage.getItem('error_reports') || '[]'
 return JSON.parse(stored).map((report: any) => ({
 ...report,
 timestamp: new Date(report.timestamp)
 }))
 } catch {
 return []
 }
 }

 clearReports() {
 this.reports = []
 try {
 localStorage.removeItem('error_reports')
 } catch (error) {
 console.error('Failed to clear stored reports:', error)
 }
 }

 private generateId(): string {
 return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
 }

 async withRetry<T>(
 operation: () => Promise<T>,
 config: Partial<RetryConfig> = {}
 ): Promise<T> {
 const defaultConfig: RetryConfig = {
 maxRetries: 3,
 baseDelay: 1000,
 maxDelay: 10000,
 backoffMultiplier: 2,
 retryableErrors: ['NetworkError', 'TimeoutError', 'AbortError', '5']
 }

 const finalConfig = { ...defaultConfig, ...config }
 let lastError: Error

 for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
 try {
 return await operation()
 } catch (error) {
 lastError = error as Error

 if (attempt === finalConfig.maxRetries) {
 break
 }

 const isRetryable = this.isRetryableError(error, finalConfig.retryableErrors)
 if (!isRetryable) {
 break
 }

 const delay = Math.min(
 finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
 finalConfig.maxDelay
 )

 this.captureMessage(
 `Retrying operation (attempt ${attempt + 1}/${finalConfig.maxRetries})`,
 'low',
 {
 component: 'retry-mechanism',
 action: 'retry'
 }
 )

 await this.delay(delay)
 }
 }

 this.captureException(lastError!, {
 component: 'retry-mechanism',
 action: 'final-failure'
 })

 throw lastError!
 }

 private isRetryableError(error: any, retryableErrors: string[]): boolean {
 const errorString = error instanceof Error ? error.message : String(error)
 const errorName = error instanceof Error ? error.name : ''
 
 return retryableErrors.some(pattern => 
 errorString.includes(pattern) || 
 errorName.includes(pattern) ||
 (error?.status && String(error.status).startsWith(pattern))
 )
 }

 private delay(ms: number): Promise<void> {
 return new Promise(resolve => setTimeout(resolve, ms))
 }

 setUserContext(userId: string, userRole: string) {
 if (typeof window !== 'undefined') {
 (window as any).__errorReportingUserContext = { userId, userRole }
 }
 }

 private getUserContext() {
 if (typeof window !== 'undefined') {
 return (window as any).__errorReportingUserContext || {}
 }
 return {}
 }
}

export const errorReportingService = new ErrorReportingService()

export { ErrorReportingService }