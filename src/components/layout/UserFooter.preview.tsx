

import React from 'react'
import UserFooter from './UserFooter'

export function UserDashboardPreview() {
 return (
 <div className="min-h-screen flex flex-col bg-neutral-light-gray">
 {}
 <header className="bg-primary-navy text-white p-4 shadow-md">
 <div className="container mx-auto flex justify-between items-center">
 <h1 className="text-2xl font-bold">Crensa</h1>
 <nav className="space-x-4">
 <a href="#" className="hover:text-accent-pink">Home</a>
 <a href="#" className="hover:text-accent-pink">Browse</a>
 <a href="#" className="hover:text-accent-pink">My Library</a>
 </nav>
 </div>
 </header>

 {}
 <main className="flex-1 container mx-auto px-4 py-8">
 <h2 className="text-3xl font-bold text-primary-navy mb-6">
 Welcome to Your Dashboard
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <div className="bg-white p-6 rounded-lg shadow">
 <h3 className="text-xl font-semibold mb-2">Coin Balance</h3>
 <p className="text-3xl font-bold text-accent-pink">1,250</p>
 </div>
 <div className="bg-white p-6 rounded-lg shadow">
 <h3 className="text-xl font-semibold mb-2">Videos Watched</h3>
 <p className="text-3xl font-bold text-accent-teal">42</p>
 </div>
 <div className="bg-white p-6 rounded-lg shadow">
 <h3 className="text-xl font-semibold mb-2">Favorites</h3>
 <p className="text-3xl font-bold text-primary-navy">18</p>
 </div>
 </div>

 <div className="bg-white p-6 rounded-lg shadow">
 <h3 className="text-2xl font-semibold mb-4">Recent Activity</h3>
 <p className="text-neutral-dark-gray">
 Your recent videos and purchases will appear here...
 </p>
 </div>
 </main>

 {}
 <UserFooter />
 </div>
 )
}

export function BrowsePagePreview() {
 return (
 <div className="min-h-screen flex flex-col">
 {}
 <header className="bg-white border-b border-neutral-gray p-4">
 <div className="container mx-auto">
 <h1 className="text-2xl font-bold text-primary-navy">Browse Content</h1>
 </div>
 </header>

 {}
 <main className="flex-1 bg-neutral-light-gray">
 <div className="container mx-auto px-4 py-8">
 <div className="mb-6">
 <input
 type="search"
 placeholder="Search videos and series..."
 className="w-full p-3 border border-neutral-gray rounded-lg"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
 <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
 <div className="h-48 bg-neutral-gray"></div>
 <div className="p-4">
 <h3 className="font-semibold mb-2">Video Title {i}</h3>
 <p className="text-sm text-neutral-dark-gray">Creator Name</p>
 <p className="text-accent-pink font-bold mt-2">🪙 50 coins</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </main>

 {}
 <UserFooter />
 </div>
 )
}

export function HelpPagePreview() {
 return (
 <div className="min-h-screen flex flex-col">
 {}
 <header className="bg-primary-navy text-white p-4">
 <div className="container mx-auto">
 <h1 className="text-2xl font-bold">Help & Support</h1>
 </div>
 </header>

 {}
 <main className="flex-1 bg-white">
 <div className="container mx-auto px-4 py-8">
 <h2 className="text-3xl font-bold text-primary-navy mb-6">
 How can we help you?
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
 <div>
 <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
 <div className="space-y-4">
 <div className="border-b border-neutral-gray pb-4">
 <h4 className="font-semibold mb-2">How do I purchase coins?</h4>
 <p className="text-neutral-dark-gray">
 Click on your coin balance and select a package...
 </p>
 </div>
 <div className="border-b border-neutral-gray pb-4">
 <h4 className="font-semibold mb-2">How do I watch a video?</h4>
 <p className="text-neutral-dark-gray">
 Browse content and click on any video...
 </p>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-xl font-semibold mb-4">Contact Support</h3>
 <form className="space-y-4">
 <input
 type="text"
 placeholder="Your Name"
 className="w-full p-3 border border-neutral-gray rounded-lg"
 />
 <input
 type="email"
 placeholder="Your Email"
 className="w-full p-3 border border-neutral-gray rounded-lg"
 />
 <textarea
 placeholder="How can we help?"
 rows={4}
 className="w-full p-3 border border-neutral-gray rounded-lg"
 />
 <button className="bg-accent-pink text-white px-6 py-3 rounded-lg hover:bg-accent-bright-pink">
 Send Message
 </button>
 </form>
 </div>
 </div>
 </div>
 </main>

 {}
 <UserFooter />
 </div>
 )
}
