import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'
import { TextDecoder, TextEncoder } from 'util'

process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'test_key_id'
process.env.RAZORPAY_KEY_SECRET = 'test_secret_key'
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

global.Request = class Request {
 constructor(url, options = {}) {
 this.url = url
 this.method = options.method || 'GET'
 this.headers = new Map(Object.entries(options.headers || {}))
 this.body = options.body
 }
 
 async json() {
 return JSON.parse(this.body)
 }
 
 async text() {
 return this.body
 }
}

global.Response = class Response {
 constructor(body, options = {}) {
 this.body = body
 this.status = options.status || 200
 this.headers = new Map(Object.entries(options.headers || {}))
 }
 
 async json() {
 return JSON.parse(this.body)
 }
 
 async text() {
 return this.body
 }
}

global.IntersectionObserver = class IntersectionObserver {
 constructor() {}
 disconnect() {}
 observe() {}
 unobserve() {}
}

Object.defineProperty(window, 'matchMedia', {
 writable: true,
 value: jest.fn().mockImplementation(query => ({
 matches: false,
 media: query,
 onchange: null,
 addListener: jest.fn(), // deprecated
 removeListener: jest.fn(), // deprecated
 addEventListener: jest.fn(),
 removeEventListener: jest.fn(),
 dispatchEvent: jest.fn(),
 })),
})