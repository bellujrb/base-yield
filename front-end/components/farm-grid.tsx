"use client"

import { motion } from "framer-motion"
import Plot from "./plot"
import type { Plot as PlotType } from "./token-farm-game"
import type { TokenType } from "./token-selector"
import type { ContractFunctionParameters } from 'viem'

interface FarmGridProps {
  plots: PlotType[]
  onPlotClick: (index: number) => void
  onPlantToken: (index: number, tokenType: TokenType, stakeAmount: number) => void
  getStakeCalls: (amount: string) => ContractFunctionParameters[]
  onTransactionSuccess: () => void
  onTransactionError: (error: unknown) => void
}

export default function FarmGrid({
  plots,
  onPlotClick,
  onPlantToken,
  getStakeCalls,
  onTransactionSuccess,
  onTransactionError,
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
            getStakeCalls={getStakeCalls}
            onTransactionSuccess={onTransactionSuccess}
            onTransactionError={onTransactionError}
          />
        ))}
      </div>
    </motion.div>
  )
}
