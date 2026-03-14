"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volleyball } from "lucide-react";

export function IntroSplash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("intro-seen");

    if (seen) {
      setShow(false);
      return;
    }

    sessionStorage.setItem("intro-seen", "true");

    const timer = setTimeout(() => setShow(false), 1450);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#132444_0%,#07111f_45%,#030712_100%)]" />

          <motion.div
            className="absolute h-36 w-36 rounded-full bg-sky-400/10 blur-3xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 0.35 }}
          />

          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ y: -180, scale: 0.85, rotate: -18 }}
              animate={{
                y: [-180, 0, -48, 0],
                scale: [0.85, 1, 0.96, 1],
                rotate: [-18, 6, -4, 0],
              }}
              transition={{
                duration: 1.05,
                times: [0, 0.58, 0.8, 1],
                ease: "easeOut",
              }}
              className="relative"
            >
              <div className="rounded-full bg-white/5 p-5 ring-1 ring-white/10 shadow-[0_0_45px_rgba(56,189,248,0.16)]">
                <Volleyball
                  className="h-16 w-16 text-white"
                  strokeWidth={2.1}
                />
              </div>
            </motion.div>

            <motion.div
              className="mt-6 h-2 w-24 rounded-full bg-black/30 blur-[1px]"
              initial={{ scaleX: 0.55, opacity: 0.35 }}
              animate={{
                scaleX: [0.55, 1.15, 0.82, 1],
                opacity: [0.35, 0.22, 0.28, 0.24],
              }}
              transition={{
                duration: 1.05,
                times: [0, 0.58, 0.8, 1],
                ease: "easeOut",
              }}
            />

            <motion.p
              className="mt-8 text-sm uppercase tracking-[0.35em] text-emerald-300"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
            >
              volleyball chicago
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
