"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { TokenType } from "./token-selector"

interface HarvestData {
  tokenType: TokenType
  tokensHarvested: number
  experienceGained: number
}

interface HarvestCelebrationProps {
  isOpen: boolean
  onClose: () => void
  harvestData: HarvestData | null
}

export default function HarvestCelebration({ isOpen, onClose, harvestData }: HarvestCelebrationProps) {
  const [showShareButton, setShowShareButton] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowShareButton(true), 800)
      return () => clearTimeout(timer)
    } else {
      setShowShareButton(false)
    }
  }, [isOpen])

  const generateCelebrationLines = () => {
    const lines = []
    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 80 + 20
      const left = (i / 40) * 100
      const color = harvestData?.tokenType.color || "#22c55e"
      const delay = i * 0.02

      lines.push(
        <motion.div
          key={i}
          className="absolute bottom-0 w-1 rounded-full"
          style={{
            left: `${left}%`,
            backgroundColor: color,
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${height}%`, opacity: 0.8 }}
          transition={{
            duration: 0.6,
            delay,
            ease: [0.4, 0, 0.2, 1],
          }}
        />,
      )
    }
    return lines
  }

  const handleShare = () => {
    const text = `Just harvested ${harvestData?.tokensHarvested} ${harvestData?.tokenType.name} tokens in Token Farm! 🌱\n\nEarned ${harvestData?.experienceGained} XP!\n\nPlay at v0.app`

    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
    window.open(farcasterUrl, "_blank")
  }

  if (!harvestData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-lg shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
              type: "spring",
              damping: 20,
              stiffness: 300,
            }}
          >
            {/* Animated Background Lines */}
            <div className="absolute inset-0 overflow-hidden">{generateCelebrationLines()}</div>

            {/* Content */}
            <div className="relative z-10 p-6 text-center">
              {/* Center Burst Animation */}
              <motion.div
                className="mx-auto mb-4 relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div
                  className="w-16 h-16 rounded-lg mx-auto"
                  style={{ backgroundColor: harvestData.tokenType.color }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />

                {/* Floating tokens */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: harvestData.tokenType.color,
                      top: "50%",
                      left: "50%",
                    }}
                    initial={{
                      scale: 0,
                      x: -6,
                      y: -6,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos((i * 60 * Math.PI) / 180) * 50 - 6,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 50 - 6,
                    }}
                    transition={{
                      duration: 1.2,
                      delay: 0.4 + i * 0.1,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                ))}
              </motion.div>

              {/* Title with tech scramble effect */}
              <motion.h2
                className="text-xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Harvest Complete!
              </motion.h2>

              <motion.p
                className="text-gray-600 mb-4 text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                You successfully harvested your {harvestData.tokenType.name} tokens
              </motion.p>

              {/* Stats Grid */}
              <motion.div
                className="grid grid-cols-2 gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-600">{harvestData.experienceGained}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">XP</div>
                </div>


              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  onClick={onClose}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>

                <AnimatePresence>
                  {showShareButton && (
                    <motion.button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                      onClick={handleShare}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                      </svg>
                      Share
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
