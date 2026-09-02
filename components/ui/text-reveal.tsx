"use client";

import { FC } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface TextRevealByWordProps {
  text: string;
  className?: string;
}

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};

const word = {
  hidden: { opacity: 0.2 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const TextRevealByWord: FC<TextRevealByWordProps> = ({ text, className }) => {
  const reduced = useReducedMotion();
  const words = text.split(" ").filter(Boolean);

  if (reduced) {
    return <p className={cn("field-lede", className)}>{text}</p>;
  }

  return (
    <motion.p
      className={cn("field-lede", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.65 }}
    >
      {words.map((item, index) => (
        <motion.span key={`${item}-${index}`} variants={word}>
          {item}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.p>
  );
};

export { TextRevealByWord };
