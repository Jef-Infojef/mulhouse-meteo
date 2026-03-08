"use client";

import React from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/Logo";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const shouldReduceMotion = useReducedMotion();

  // If the user prefers reduced motion, we simplify the animation
  const containerAnimation = { opacity: 0 };
  const containerTransition = shouldReduceMotion 
    ? { duration: 0.5, delay: 0.5 } 
    : { duration: 0.8, delay: 2.2, ease: "easeOut" };

  const logoInitial = shouldReduceMotion 
    ? { scale: 1, opacity: 0 } 
    : { scale: 0.5, opacity: 0, rotate: -45 };

  const logoAnimation = shouldReduceMotion
    ? { scale: 1, opacity: [0, 1, 1] }
    : { 
        scale: [0.5, 1.2, 80], 
        opacity: [0, 1, 1],
        rotate: [0, 0, 0]
      };
  
  const logoTransition = shouldReduceMotion
    ? { duration: 0.5 }
    : {
        duration: 2.5,
        times: [0, 0.4, 1],
        ease: "easeInOut"
      };

  const textInitial = shouldReduceMotion 
    ? { opacity: 0 } 
    : { opacity: 0, y: 20 };

  const textAnimation = shouldReduceMotion
    ? { opacity: [0, 1, 0] }
    : { opacity: [0, 1, 0], y: [20, 0, -50] };

  const textTransition = shouldReduceMotion
    ? { duration: 0.5, delay: 0.2 }
    : { duration: 1.5, delay: 0.5 };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950"
        initial={{ opacity: 1 }}
        animate={containerAnimation}
        transition={containerTransition}
        onAnimationComplete={onFinish}
      >
        <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
          <m.div
            initial={logoInitial}
            animate={logoAnimation}
            transition={logoTransition}
            className="relative z-10"
          >
            {/* On utilise une div conteneur pour s'assurer que le SVG reste net */}
            <div className="w-48 h-48 md:w-64 md:h-64">
               <Logo className="w-full h-full text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </div>
          </m.div>

          <m.div
              initial={textInitial}
              animate={textAnimation}
              transition={textTransition}
              className="absolute bottom-1/4 text-white text-2xl font-bold tracking-widest uppercase"
          >
              Mulhouse Météo
          </m.div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
