import { motion } from "framer-motion"
import { cn } from "@/utils"

export const AnimatedText = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => {
  const words = text.split(" ")

  return (
    <motion.h2
      className={cn("flex flex-wrap overflow-hidden", className)}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="mr-2 inline-block"
          initial={{ y: "100%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
          viewport={{ once: true, margin: "-10%" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.h2>
  )
}

export const FadeIn = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
