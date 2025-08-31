"use client"

import { motion } from "framer-motion"
import Plot from "./plot"
import type { Plot as PlotType } from "./token-farm-game"
import type { TokenType } from "./token-selector"

interface FarmGridProps {
  plots: PlotType[]
  onPlotClick: (index: number) => void
  onPlantToken: (index: number, tokenType: TokenType, stakeAmount: number) => void
  collectionAnimation?: { index: number; tokens: number } | null
  playerLevel: number
}

export default function FarmGrid({
  plots,
  onPlotClick,
  onPlantToken,
  collectionAnimation,
  playerLevel,
}: FarmGridProps) {
  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
    >
      <div className="grid grid-cols-3 gap-2">
        {plots.map((plot, index) => (
          <Plot
            key={index}
            plot={plot}
            onPlant={(tokenType, stakeAmount) => onPlantToken(index, tokenType, stakeAmount)}
            onHarvest={() => onPlotClick(index)}
            isAnimating={collectionAnimation?.index === index}
            animationTokens={collectionAnimation?.tokens || 0}
            playerLevel={playerLevel}
          />
        ))}
      </div>
    </motion.div>
  )
}
