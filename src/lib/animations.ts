import { Variants } from 'framer-motion'

export const createScrollAnimationVariants = (shouldReduceMotion: boolean) => ({
 container: {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 staggerChildren: shouldReduceMotion ? 0 : 0.15,
 },
 },
 },
 
 header: {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 30,
 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 ease: "easeOut",
 },
 },
 },
 
 item: {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 40,
 scale: shouldReduceMotion ? 1 : 0.95,
 },
 visible: {
 opacity: 1,
 y: 0,
 scale: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 ease: "easeOut",
 },
 },
 },
 
 staggeredItem: {
 hidden: {
 opacity: 0,
 y: shouldReduceMotion ? 0 : 40,
 scale: shouldReduceMotion ? 1 : 0.95,
 },
 visible: {
 opacity: 1,
 y: 0,
 scale: 1,
 transition: {
 duration: shouldReduceMotion ? 0.01 : 0.6,
 ease: "easeOut",
 },
 },
 },
});

export const fadeInUp: Variants = {
 initial: {
 opacity: 0,
 y: 30,
 },
 animate: {
 opacity: 1,
 y: 0,
 transition: {
 duration: 0.6,
 ease: 'easeOut',
 },
 },
}

export const fadeIn: Variants = {
 initial: {
 opacity: 0,
 },
 animate: {
 opacity: 1,
 transition: {
 duration: 0.6,
 ease: 'easeOut',
 },
 },
}

export const staggerContainer: Variants = {
 initial: {},
 animate: {
 transition: {
 staggerChildren: 0.1,
 },
 },
}

export const scaleOnHover: Variants = {
 initial: {
 scale: 1,
 },
 hover: {
 scale: 1.05,
 transition: {
 duration: 0.2,
 ease: 'easeInOut',
 },
 },
}

export const createHoverVariants = (shouldReduceMotion: boolean) => ({
 cardHover: {
 scale: shouldReduceMotion ? 1 : 1.02,
 y: shouldReduceMotion ? 0 : -8,
 transition: {
 duration: 0.3,
 ease: "easeOut",
 },
 },
 
 buttonHover: {
 scale: shouldReduceMotion ? 1 : 1.05,
 transition: {
 duration: 0.2,
 ease: "easeInOut",
 },
 },
 
 iconHover: {
 scale: shouldReduceMotion ? 1 : 1.1,
 transition: {
 duration: 0.2,
 ease: "easeInOut",
 },
 },
});

export const smoothScrollTo = (elementId: string, offset: number = 80) => {
 const element = document.getElementById(elementId.replace('#', ''));
 if (element) {
 const elementPosition = element.getBoundingClientRect().top;
 const offsetPosition = elementPosition + window.pageYOffset - offset;

 window.scrollTo({
 top: offsetPosition,
 behavior: 'smooth'
 });
 }
};