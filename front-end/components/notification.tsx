"use client"

import { motion } from "framer-motion"

interface NotificationProps {
  message: string
}

export default function Notification({ message }: NotificationProps) {
  return (
    <motion.div
      className="fixed top-4 right-4 left-4 bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-lg shadow-lg z-[9999] font-medium max-w-md mx-auto"
      initial={{ x: 100, opacity: 0, scale: 0.9 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.24,
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
      <div className="pl-2 text-sm">{message}</div>
    </motion.div>
  )
}
