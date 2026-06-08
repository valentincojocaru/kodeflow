import { useScroll, useSpring, motion } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9997] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #b855ff, #f050c8, #b855ff)",
        boxShadow: "0 0 8px rgba(184,80,255,0.8), 0 0 16px rgba(184,80,255,0.4)",
      }}
    />
  );
}
