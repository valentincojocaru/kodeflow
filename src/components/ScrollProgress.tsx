import { useScroll, useSpring, motion } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[9997] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #f97316, #fb923c, #f97316)",
        boxShadow: "0 0 8px rgba(249,115,22,0.7), 0 0 16px rgba(249,115,22,0.3)",
      }}
    />
  );
}
