"use client"

import { motion } from "framer-motion"
import type { GameState } from "./token-farm-game"

interface GameHeaderProps {
  gameState: GameState
}

export default function GameHeader({ gameState }: GameHeaderProps) {
  const stakedTokens = Math.floor(gameState.tokens * 0.6) // 60% staked

  return (
    <motion.div
      className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6 shadow-lg shadow-blue-500/10"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-green-50/30 rounded-2xl"></div>

      <div className="relative flex flex-row gap-3">
        {/* Level */}
        <motion.div
          className="group relative flex-1"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-xl border border-green-200/30 backdrop-blur-sm"></div>

          <div className="absolute -top-1 -right-1 flex items-end gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-md shadow-lg shadow-green-500/30"></div>
            <div className="w-2 h-4 bg-gradient-to-br from-green-500 to-green-700 rounded-md shadow-lg shadow-green-500/40"></div>
            <div className="w-1.5 h-2 bg-gradient-to-br from-green-300 to-green-500 rounded-sm shadow-lg shadow-green-500/20"></div>
          </div>

          <div className="relative p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-xs font-semibold text-green-600/80 uppercase tracking-wider">Level</div>
            </div>
            <div className="text-xl font-black text-gray-900 mb-1 font-mono">{gameState.level}</div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-green-600/70 font-medium">
                <span>Progress</span>
                <span>{gameState.experience % 100}%</span>
              </div>
              <div className="relative w-full bg-green-100/50 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${gameState.experience % 100}%` }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
