"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { fadeIn } from "@/lib/animations";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="animate"
      variants={fadeIn}
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
