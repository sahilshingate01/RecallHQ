"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const displayValue = useTransform(spring, (latest) => Math.floor(latest));
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  // Sync state for SSR/Initial render
  useEffect(() => {
    return displayValue.on("change", (latest) => {
      setCurrentValue(Math.floor(latest));
    });
  }, [displayValue]);

  return <motion.span>{currentValue}</motion.span>;
}
