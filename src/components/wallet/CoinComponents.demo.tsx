

'use client'

import { useState } from 'react'
import CoinBalance from './CoinBalance'
import CoinPrice from './CoinPrice'

export default function CoinComponentsDemo() {
 const [balance, setBalance] = useState(1250)
 const [clickCount, setClickCount] = useState(0)

 return (
 <div className="p-8 max-w-6xl mx-auto space-y-12">
 <header className="text-center">
 <h1 className="text-4xl font-bold mb-2">Coin Display Components Demo</h1>
 <p className="text-gray-600">
 Visual showcase of CoinBalance and CoinPrice components
 </p>
 </header>

 {}
 <section className="space-y-6">
 <h2 className="text-3xl font-bold border-b pb-2">CoinBalance Component</h2>
 
 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Size Variants</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Small</p>
 <CoinBalance balance={balance} size="small" />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Medium (Default)</p>
 <CoinBalance balance={balance} size="medium" />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Large</p>
 <CoinBalance balance={balance} size="large" />
 </div>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">With Rupee Equivalent</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Small</p>
 <CoinBalance balance={balance} size="small" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Medium</p>
 <CoinBalance balance={balance} size="medium" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Large</p>
 <CoinBalance balance={balance} size="large" showRupeeEquivalent />
 </div>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Interactive (Clickable)</h3>
 <div className="p-6 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-4">
 Click count: {clickCount}
 </p>
 <CoinBalance 
 balance={balance}
 size="large"
 showRupeeEquivalent
 onClick={() => setClickCount(c => c + 1)}
 />
 <p className="text-xs text-gray-500 mt-2">
 Try clicking or using keyboard (Tab + Enter/Space)
 </p>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Different Balance Amounts</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Zero</p>
 <CoinBalance balance={0} size="small" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Small</p>
 <CoinBalance balance={50} size="small" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Medium</p>
 <CoinBalance balance={1000} size="small" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Large</p>
 <CoinBalance balance={123456} size="small" showRupeeEquivalent />
 </div>
 </div>
 </div>
 </section>

 {}
 <section className="space-y-6">
 <h2 className="text-3xl font-bold border-b pb-2">CoinPrice Component</h2>
 
 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Size Variants</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Small</p>
 <CoinPrice coins={50} size="small" />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Medium (Default)</p>
 <CoinPrice coins={50} size="medium" />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Large</p>
 <CoinPrice coins={50} size="large" />
 </div>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Display Variants</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Default</p>
 <CoinPrice coins={100} variant="default" />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Badge</p>
 <CoinPrice coins={100} variant="badge" />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Inline</p>
 <CoinPrice coins={100} variant="inline" />
 </div>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">With Rupee Equivalent</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Default</p>
 <CoinPrice coins={100} showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Badge</p>
 <CoinPrice coins={100} variant="badge" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-sm text-gray-600 mb-2">Inline</p>
 <CoinPrice coins={100} variant="inline" showRupeeEquivalent />
 </div>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Common Price Points</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Minimum (1 coin)</p>
 <CoinPrice coins={1} size="small" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Low Price</p>
 <CoinPrice coins={20} size="small" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Medium Price</p>
 <CoinPrice coins={100} size="small" showRupeeEquivalent />
 </div>
 <div className="p-4 bg-gray-50 rounded-lg">
 <p className="text-xs text-gray-600 mb-2">Maximum (2000 coins)</p>
 <CoinPrice coins={2000} size="small" showRupeeEquivalent />
 </div>
 </div>
 </div>
 </section>

 {}
 <section className="space-y-6">
 <h2 className="text-3xl font-bold border-b pb-2">Real-World Examples</h2>
 
 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Video Card</h3>
 <div className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
 <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400"></div>
 <div className="p-4">
 <h4 className="font-bold text-lg mb-2">Amazing Video Title</h4>
 <p className="text-gray-600 text-sm mb-3">
 This is a great video you should watch!
 </p>
 <div className="flex items-center justify-between">
 <CoinPrice coins={50} variant="badge" />
 <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
 Watch Now
 </button>
 </div>
 </div>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Dashboard Header</h3>
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="text-2xl font-bold mb-1">Welcome back, User!</h4>
 <p className="text-gray-600">Ready to watch something amazing?</p>
 </div>
 <CoinBalance 
 balance={balance}
 size="large"
 showRupeeEquivalent
 onClick={() => alert('Navigate to wallet')}
 />
 </div>
 </div>
 </div>

 {}
 <div className="space-y-4">
 <h3 className="text-xl font-semibold">Purchase Modal</h3>
 <div className="max-w-md bg-white rounded-lg shadow-lg p-6">
 <h4 className="text-xl font-bold mb-4">Confirm Purchase</h4>
 
 <div className="space-y-4 mb-6">
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Price:</span>
 <CoinPrice coins={100} size="large" showRupeeEquivalent />
 </div>
 
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Your Balance:</span>
 <CoinBalance balance={balance} size="medium" />
 </div>
 
 <div className="flex justify-between items-center pt-4 border-t">
 <span className="font-semibold">After Purchase:</span>
 <CoinBalance balance={balance - 100} size="medium" showRupeeEquivalent />
 </div>
 </div>
 
 <div className="flex gap-3">
 <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
 Cancel
 </button>
 <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg">
 Confirm
 </button>
 </div>
 </div>
 </div>
 </section>

 {}
 <section className="space-y-6">
 <h2 className="text-3xl font-bold border-b pb-2">Interactive Controls</h2>
 <div className="bg-gray-50 rounded-lg p-6">
 <h3 className="text-lg font-semibold mb-4">Adjust Balance</h3>
 <div className="flex items-center gap-4 mb-4">
 <button
 onClick={() => setBalance(Math.max(0, balance - 100))}
 className="px-4 py-2 bg-red-500 text-white rounded-lg"
 >
 -100 coins
 </button>
 <button
 onClick={() => setBalance(balance + 100)}
 className="px-4 py-2 bg-green-500 text-white rounded-lg"
 >
 +100 coins
 </button>
 <button
 onClick={() => setBalance(0)}
 className="px-4 py-2 bg-gray-500 text-white rounded-lg"
 >
 Reset to 0
 </button>
 <button
 onClick={() => setBalance(1250)}
 className="px-4 py-2 bg-blue-500 text-white rounded-lg"
 >
 Reset to 1,250
 </button>
 </div>
 <div className="p-4 bg-white rounded-lg">
 <CoinBalance balance={balance} size="large" showRupeeEquivalent />
 </div>
 </div>
 </section>
 </div>
 )
}
