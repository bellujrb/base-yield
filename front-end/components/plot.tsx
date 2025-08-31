"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Plot as PlotType } from "./token-farm-game"
import TokenSelector, { type TokenType } from "./token-selector"
import type { ContractFunctionParameters } from 'viem'

interface PlotProps {
  plot: PlotType
  onPlant: (tokenType: TokenType, stakeAmount: number) => void
  onHarvest: () => void
  isAnimating?: boolean
  getStakeCalls: (amount: string) => ContractFunctionParameters[]
  onTransactionSuccess: () => void
  onTransactionError: (error: unknown) => void
}

export default function Plot({
  plot,
  onPlant,
  onHarvest,
  isAnimating,
  getStakeCalls,
  onTransactionSuccess,
  onTransactionError,
}: PlotProps) {
  const [showTokenSelector, setShowTokenSelector] = useState(false)

  const { progressPercent, timeRemaining } = useMemo(() => {
    if (!plot.planted) {
      return { progressPercent: 0, timeRemaining: "" }
    }

    const now = Date.now()
    const totalGrowthTime = plot.harvestTime - plot.plantTime
    const elapsed = now - plot.plantTime
    const progress = Math.min(elapsed / totalGrowthTime, 1)

    const remaining = Math.max(0, plot.harvestTime - now)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`

    return {
      progressPercent: progress * 100,
      timeRemaining: timeStr,
    }
  }, [plot])

  const handleClick = () => {
    if (!plot.planted) {
      setShowTokenSelector(true)
    } else if (plot.ready) {
      onHarvest()
    }
  }

  const handleSelectToken = (tokenType: TokenType, stakeAmount: number) => {
    onPlant(tokenType, stakeAmount)
    setShowTokenSelector(false)
  }

  const generateVerticalLines = (stage: number, ready: boolean, tokenColor?: string) => {
    const lines = []
    const lineCount = Math.min(stage * 6, 18)
    const colors = ready
      ? ["#22c55e", "#16a34a", "#15803d"]
      : tokenColor
        ? [tokenColor, tokenColor, tokenColor]
        : ["#ec4899", "#db2777", "#be185d"]

    for (let i = 0; i < lineCount; i++) {
      const height = Math.random() * 50 + 15
      const left = (i / lineCount) * 100
      const color = colors[Math.floor(Math.random() * colors.length)]
      const opacity = ready ? 0.8 : 0.4 + (stage / 4) * 0.4

      lines.push(
        <motion.div
          key={i}
          className="absolute bottom-0 w-0.5 rounded-full"
          style={{
            left: `${left}%`,
            backgroundColor: color,
            opacity: opacity,
          }}
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{
            duration: 0.6,
            delay: i * 0.05,
            ease: [0.4, 0, 0.2, 1],
          }}
        />,
      )
    }
    return lines
  }

  return (
    <>
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
      >
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: "#0052ff" }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.5, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={`
            w-28 h-28 relative cursor-pointer overflow-hidden
            bg-white border border-gray-200 rounded-sm
            transition-all duration-200
            ${plot.ready ? "shadow-lg shadow-green-500/20 border-green-400" : ""}
            ${!plot.planted ? "hover:shadow-md hover:border-blue-300" : ""}
          `}
          onClick={handleClick}
          layout
        >
          <div className="absolute inset-0 opacity-5">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `linear-gradient(90deg, #000 1px, transparent 1px),
                                 linear-gradient(0deg, #000 1px, transparent 1px)`,
                backgroundSize: "6px 6px",
              }}
            />
          </div>

          {!plot.planted && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.24 }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="w-6 h-6 bg-blue-600 rounded-sm"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.12 }}
                />
                <div className="text-xs text-gray-600 font-medium">Plant</div>
              </div>
            </motion.div>
          )}

          {plot.planted && (
            <>
              <div className="absolute inset-0">
                {generateVerticalLines(plot.growthStage, plot.ready, "#0052ff")}
              </div>



              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  rotate: plot.ready ? [0, 5, -5, 0] : 0,
                }}
                transition={{
                  duration: 0.24,
                  rotate: { duration: 2, repeat: plot.ready ? Number.POSITIVE_INFINITY : 0 },
                }}
              >
                <motion.div
                  className="rounded-sm"
                  style={{
                    backgroundColor: plot.ready ? "#22c55e" : "#0052ff",
                  }}
                  animate={{
                    width: `${12 + plot.growthStage * 3}px`,
                    height: `${12 + plot.growthStage * 3}px`,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
              </motion.div>

              {!plot.ready && (
                <motion.div
                  className="absolute top-2 right-2 bg-gray-800 text-white px-1.5 py-0.5 rounded-sm text-xs font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.24 }}
                >
                  {timeRemaining}
                </motion.div>
              )}

              {!plot.ready && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-b-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                />
              )}

              {plot.ready && (
                <motion.div
                  className="absolute inset-0 border-2 border-green-500 rounded-sm"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      <TokenSelector
        isOpen={showTokenSelector}
        onClose={() => setShowTokenSelector(false)}
        onSelectToken={handleSelectToken}
        getStakeCalls={getStakeCalls}
        onTransactionSuccess={onTransactionSuccess}
        onTransactionError={onTransactionError}
      />
    </>
  )
}
