'use client'

import Link from 'next/link'
import { FooterContent } from '@/types'
import { Twitter, Instagram, Music, Youtube } from 'lucide-react'

interface FooterProps {
 content: FooterContent
}

const getSocialIcon = (iconName: string) => {
 switch (iconName.toLowerCase()) {
 case 'twitter':
 return Twitter
 case 'instagram':
 return Instagram
 case 'tiktok':
 return Music
 case 'youtube':
 return Youtube
 default:
 return Twitter
 }
}

export default function Footer({ content }: FooterProps) {
 const currentYear = new Date().getFullYear()

 return (
 <footer className="bg-primary-navy text-neutral-white">
 {}
 <div className="border-b border-neutral-white/10">
 <div className="container section-padding-sm">
 <div className="text-center max-w-3xl mx-auto">
 <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-white mb-4">
 {content.finalCta.title}
 </h2>
 <p className="text-lg md:text-xl text-neutral-white/80 mb-8">
 {content.finalCta.description}
 </p>
 <Link
 href={content.finalCta.buttonLink}
 className="btn-primary inline-block"
 >
 {content.finalCta.buttonText}
 </Link>
 </div>
 </div>
 </div>

 {}
 <div className="container section-padding">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
 {}
 <div className="lg:col-span-2">
 <Link href="/" className="flex items-center space-x-2 mb-6">
 <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
 <span className="text-primary-navy font-bold text-xl">C</span>
 </div>
 <span className="font-bold text-2xl text-neutral-white">
 {content.tagline}
 </span>
 </Link>
 <p className="text-neutral-white/80 mb-6 leading-relaxed">
 {content.description}
 </p>
 
 {}
 <div className="mb-6">
 <h4 className="font-semibold text-neutral-white mb-2">Contact Us</h4>
 <a
 href={`mailto:${content.contactEmail}`}
 className="text-neutral-white/80 hover:text-primary-neon-yellow transition-colors duration-200"
 >
 {content.contactEmail}
 </a>
 </div>

 {}
 <div>
 <h4 className="font-semibold text-neutral-white mb-4">Follow Us</h4>
 <div className="flex space-x-4">
 {content.socialLinks.map((social) => {
 const IconComponent = getSocialIcon(social.icon)
 return (
 <a
 key={social.name}
 href={social.url}
 target="_blank"
 rel="noopener noreferrer"
 className="w-10 h-10 bg-neutral-white/10 rounded-lg flex items-center justify-center hover:bg-primary-neon-yellow hover:text-primary-navy transition-all duration-200 group"
 aria-label={`Follow us on ${social.name}`}
 >
 <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
 </a>
 )
 })}
 </div>
 </div>
 </div>

 {}
 {content.sections.map((section) => (
 <div key={section.title}>
 <h4 className="font-semibold text-neutral-white mb-4">
 {section.title}
 </h4>
 <ul className="space-y-3">
 {section.links.map((link) => (
 <li key={link.href}>
 <Link
 href={link.href}
 className="text-neutral-white/80 hover:text-primary-neon-yellow transition-colors duration-200"
 >
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>

 {}
 <div className="border-t border-neutral-white/10">
 <div className="container py-6">
 <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
 <p className="text-neutral-white/60 text-sm">
 {content.legal.copyright.replace('2024', currentYear.toString())}
 </p>
 <div className="flex flex-wrap justify-center md:justify-end gap-6">
 {content.legal.links.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 className="text-neutral-white/60 hover:text-neutral-white text-sm transition-colors duration-200"
 >
 {link.label}
 </Link>
 ))}
 </div>
 </div>
 </div>
 </div>
 </footer>
 )
}