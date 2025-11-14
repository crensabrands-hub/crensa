import { AnimatedTextLoader } from '@/components/ui/AnimatedTextLoader'

export default function Loading() {
 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-neutral-gray via-white to-neutral-light-gray">
 <div className="w-full max-w-md px-8">
 <AnimatedTextLoader text="CRENSA" />
 </div>
 </div>
 )
}
