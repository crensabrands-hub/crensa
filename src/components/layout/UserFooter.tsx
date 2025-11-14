'use client'

import Link from 'next/link'

interface UserFooterProps {
 className?: string
}

export default function UserFooter({ className = '' }: UserFooterProps) {
 const currentYear = new Date().getFullYear()

 const footerLinks = [
 { label: 'About Us', href: '/about' },
 { label: 'Browse Content', href: '/browse' },
 { label: 'Help & Support', href: '/help' },
 { label: 'Privacy Policy', href: '/privacy' },
 { label: 'Terms of Service', href: '/terms' },
 { label: 'Contact Us', href: '/contact' },
 { label: 'Community Guidelines', href: '/community-guidelines' },
 ]

 return (
 <footer className={`bg-neutral-white border-t border-neutral-gray ${className}`}>
 <div className="container mx-auto px-4 py-6">
 {}
 <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
 {}
 <div className="flex items-center space-x-2">
 <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
 <span className="text-primary-navy font-bold text-lg">C</span>
 </div>
 <span className="font-bold text-xl text-primary-navy">Crensa</span>
 </div>

 {}
 <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
 {footerLinks.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 className="text-sm text-neutral-dark-gray hover:text-accent-pink transition-colors duration-200"
 >
 {link.label}
 </Link>
 ))}
 </nav>
 </div>

 {}
 <div className="mt-6 pt-6 border-t border-neutral-gray">
 <p className="text-center text-sm text-neutral-dark-gray">
 © {currentYear} Crensa. All rights reserved.
 </p>
 </div>
 </div>
 </footer>
 )
}
