import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.2, 0.8, 0.2, 1] // Custom smooth ease
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1]
    }
  }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: "easeOut" as any } },
  whileTap: { scale: 0.98 }
};

export const cardShadowHover = {
  whileHover: {
    y: -4,
    boxShadow: "12px 12px 24px rgba(163,177,198,0.65), -12px -12px 24px rgba(255,255,255,0.95)",
    transition: { duration: 0.3, ease: "easeOut" as any }
  },
  whileTap: { scale: 0.99 }
};

export const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20
};

export const parallaxCard = {
  initial: { rotateX: 0, rotateY: 0 },
  hover: (mouse: { x: number, y: number }) => ({
    rotateX: (mouse.y - 0.5) * 10,
    rotateY: (mouse.x - 0.5) * -10,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  })
};

