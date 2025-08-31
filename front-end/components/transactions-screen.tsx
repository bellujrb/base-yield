"use client"

import { motion } from "framer-motion"

export default function TransactionsScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      className="flex-1 flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
        className="text-center"
      >
        <h1 className="text-xl font-bold text-gray-900 mb-3">Transactions</h1>
        <p className="text-gray-500 text-sm">Coming soon...</p>
      </motion.div>
    </motion.div>
  )
}
