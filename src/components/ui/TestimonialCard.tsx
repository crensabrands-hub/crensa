'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Testimonial } from '@/types'
import { StarRating } from './StarRating'
import { optimizedImageProps } from '@/lib/performance'
import { generateAriaLabel } from '@/lib/accessibility'

interface TestimonialCardProps {
 testimonial: Testimonial
 className?: string
}

export function TestimonialCard({ testimonial, className = '' }: TestimonialCardProps) {
 const { name, role, avatar, content, rating } = testimonial
 const [imageError, setImageError] = useState(false)

 const roleStyles = {
 creator: {
 badge: 'bg-accent-pink text-white',
 border: 'border-accent-pink/20',
 accent: 'text-accent-pink'
 },
 viewer: {
 badge: 'bg-accent-teal text-white',
 border: 'border-accent-teal/20',
 accent: 'text-accent-teal'
 }
 }

 const styles = roleStyles[role]
 const initials = name.split(' ').map(n => n[0]).join('')

 return (
 <article 
 className={`card card-hover ${styles.border} border-2 !p-4 sm:!p-6 md:!p-8 ${className}`}
 role="article"
 aria-labelledby={`testimonial-${name.replace(/\s+/g, '-').toLowerCase()}`}
 >
 {}
 <div className="flex justify-between items-start mb-4 sm:mb-6">
 <span 
 className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${styles.badge}`}
 aria-label={`${role} testimonial`}
 >
 {role === 'creator' ? 'Creator' : 'Viewer'}
 </span>
 <div aria-label={generateAriaLabel.rating(rating)}>
 <StarRating rating={rating} size="sm" />
 </div>
 </div>

 {}
 <blockquote className="text-neutral-darkGray mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base md:text-lg px-2 sm:px-0">
 <span className="sr-only">Quote:</span>
 &ldquo;{content}&rdquo;
 </blockquote>

 {}
 <div className="flex items-center gap-3 px-2 sm:px-0">
 <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-neutral-gray flex-shrink-0">
 {!imageError ? (
 <Image
 src={avatar}
 alt={`${name}'s profile picture`}
 fill
 className="object-cover"
 {...optimizedImageProps}
 onError={() => setImageError(true)}
 sizes="48px"
 />
 ) : (
 <div 
 className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-pink to-accent-teal text-white font-semibold text-sm sm:text-lg"
 aria-label={`${name}'s initials`}
 >
 {initials}
 </div>
 )}
 </div>
 <div>
 <h4 
 id={`testimonial-${name.replace(/\s+/g, '-').toLowerCase()}`}
 className="font-semibold text-primary-navy text-sm sm:text-base"
 >
 {name}
 </h4>
 <p className={`text-xs sm:text-sm ${styles.accent} capitalize`}>
 <span className="sr-only">Role:</span>
 {role}
 </p>
 </div>
 </div>
 </article>
 )
}