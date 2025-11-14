

'use client'

import { useState } from 'react'
import CoinInput from './CoinInput'

export function BasicCoinInputExample() {
 const [price, setPrice] = useState(50)

 return (
 <div className="p-4 space-y-4">
 <h3 className="text-lg font-semibold">Basic Coin Input</h3>
 <CoinInput 
 value={price}
 onChange={setPrice}
 />
 <p className="text-sm text-gray-600">
 Current value: {price} coins
 </p>
 </div>
 )
}

export function VideoUploadFormExample() {
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 coinPrice: 50
 })
 const [errors, setErrors] = useState<Record<string, string>>({})

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault()

 const newErrors: Record<string, string> = {}
 if (!formData.title) newErrors.title = 'Title is required'
 if (formData.coinPrice < 1) newErrors.coinPrice = 'Price must be at least 1 coin'
 
 if (Object.keys(newErrors).length > 0) {
 setErrors(newErrors)
 return
 }

 console.log('Submitting video:', formData)
 }

 return (
 <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md">
 <h3 className="text-lg font-semibold">Upload Video</h3>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Video Title *
 </label>
 <input 
 type="text"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
 placeholder="Enter video title"
 />
 {errors.title && (
 <p className="mt-1 text-sm text-red-600">{errors.title}</p>
 )}
 </div>

 <CoinInput 
 value={formData.coinPrice}
 onChange={(price) => setFormData({ ...formData, coinPrice: price })}
 label="Video Price"
 required
 error={errors.coinPrice}
 />
 
 <button 
 type="submit"
 className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
 >
 Upload Video
 </button>
 </form>
 )
}

export function CustomRangeCoinInputExample() {
 const [price, setPrice] = useState(25)

 return (
 <div className="p-4 space-y-4">
 <h3 className="text-lg font-semibold">Custom Range (10-100 coins)</h3>
 <CoinInput 
 value={price}
 onChange={setPrice}
 min={10}
 max={100}
 label="Limited Range Price"
 />
 </div>
 )
}

export function NoRupeeEquivalentExample() {
 const [price, setPrice] = useState(100)

 return (
 <div className="p-4 space-y-4">
 <h3 className="text-lg font-semibold">Without Rupee Equivalent</h3>
 <CoinInput 
 value={price}
 onChange={setPrice}
 showRupeeEquivalent={false}
 label="Coin Amount"
 />
 </div>
 )
}

export function DisabledCoinInputExample() {
 const [price] = useState(150)

 return (
 <div className="p-4 space-y-4">
 <h3 className="text-lg font-semibold">Disabled Input</h3>
 <CoinInput 
 value={price}
 onChange={() => {}}
 disabled
 label="Fixed Price"
 />
 <p className="text-sm text-gray-600">
 This price cannot be changed
 </p>
 </div>
 )
}

export function SeriesCreationExample() {
 const [seriesData, setSeriesData] = useState({
 title: '',
 coinPrice: 200
 })
 const [isSubmitting, setIsSubmitting] = useState(false)

 const handleCreate = async () => {
 setIsSubmitting(true)

 await new Promise(resolve => setTimeout(resolve, 1000))
 console.log('Creating series:', seriesData)
 setIsSubmitting(false)
 }

 return (
 <div className="p-4 space-y-4 max-w-md">
 <h3 className="text-lg font-semibold">Create Series</h3>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Series Title *
 </label>
 <input 
 type="text"
 value={seriesData.title}
 onChange={(e) => setSeriesData({ ...seriesData, title: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
 placeholder="Enter series title"
 disabled={isSubmitting}
 />
 </div>

 <CoinInput 
 value={seriesData.coinPrice}
 onChange={(price) => setSeriesData({ ...seriesData, coinPrice: price })}
 label="Series Price"
 required
 disabled={isSubmitting}
 placeholder="Enter series price"
 />
 
 <button 
 onClick={handleCreate}
 disabled={isSubmitting}
 className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
 >
 {isSubmitting ? 'Creating...' : 'Create Series'}
 </button>
 </div>
 )
}

export function CoinInputDemo() {
 return (
 <div className="min-h-screen bg-gray-50 py-8">
 <div className="max-w-6xl mx-auto px-4">
 <h1 className="text-3xl font-bold mb-8">CoinInput Component Examples</h1>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="bg-white rounded-lg shadow p-6">
 <BasicCoinInputExample />
 </div>
 
 <div className="bg-white rounded-lg shadow p-6">
 <CustomRangeCoinInputExample />
 </div>
 
 <div className="bg-white rounded-lg shadow p-6">
 <NoRupeeEquivalentExample />
 </div>
 
 <div className="bg-white rounded-lg shadow p-6">
 <DisabledCoinInputExample />
 </div>
 
 <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
 <VideoUploadFormExample />
 </div>
 
 <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
 <SeriesCreationExample />
 </div>
 </div>
 </div>
 </div>
 )
}
