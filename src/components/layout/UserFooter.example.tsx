

import React from 'react'
import UserFooter from './UserFooter'

export function BasicUserFooterExample() {
 return (
 <div className="min-h-screen flex flex-col">
 <main className="flex-1">
 {}
 <div className="container mx-auto px-4 py-8">
 <h1>User Dashboard</h1>
 <p>Your content goes here...</p>
 </div>
 </main>
 
 {}
 <UserFooter />
 </div>
 )
}

export function CustomStyledUserFooterExample() {
 return (
 <div className="min-h-screen flex flex-col">
 <main className="flex-1">
 {}
 <div className="container mx-auto px-4 py-8">
 <h1>Browse Content</h1>
 <p>Your content goes here...</p>
 </div>
 </main>
 
 {}
 <UserFooter className="shadow-lg" />
 </div>
 )
}

export function MemberLayoutWithUserFooterExample() {
 return (
 <div className="min-h-screen flex flex-col">
 {}
 <header className="bg-primary-navy text-white p-4">
 <h1>Member Area</h1>
 </header>
 
 {}
 <main className="flex-1 bg-neutral-light-gray">
 <div className="container mx-auto px-4 py-8">
 <h2>My Library</h2>
 <p>Your videos and series...</p>
 </div>
 </main>
 
 {}
 <UserFooter />
 </div>
 )
}

export function ResponsiveUserFooterExample() {
 return (
 <div className="min-h-screen flex flex-col">
 <main className="flex-1">
 <div className="container mx-auto px-4 py-8">
 <h1>Help & Support</h1>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>FAQ Section</div>
 <div>Contact Form</div>
 </div>
 </div>
 </main>
 
 {}
 <UserFooter />
 </div>
 )
}

