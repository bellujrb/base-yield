"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export interface TokenType {
  id: string
  name: string
  cost: number
  growthTime: number
  baseReward: number
  color: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockLevel: number
  description: string
}

export const TOKEN_TYPES: TokenType[] = [
  {
    id: "base",
    name: "BASE",
    cost: 10,
    growthTime: 30000, // 30 seconds
    baseReward: 15,
    color: "#0052ff",
    rarity: "common",
    unlockLevel: 1,
    description: "The foundation token",
  },
  {
    id: "eth",
    name: "ETH",
    cost: 25,
    growthTime: 45000, // 45 seconds
    baseReward: 40,
    color: "#627eea",
    rarity: "rare",
    unlockLevel: 3,
    description: "Ethereum's native token",
  },
  {
    id: "usdc",
    name: "USDC",
    cost: 50,
    growthTime: 60000, // 1 minute
    baseReward: 80,
    color: "#2775ca",
    rarity: "epic",
    unlockLevel: 5,
    description: "Stable and reliable",
  },
  {
    id: "onchain",
    name: "ONCHAIN",
    cost: 100,
    growthTime: 90000, // 1.5 minutes
    baseReward: 180,
    color: "#ff6b35",
    rarity: "legendary",
    unlockLevel: 8,
    description: "The future is onchain",
  },
]

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (tokenType: TokenType, stakeAmount: number) => void
  playerLevel: number
}

export default function TokenSelector({
  isOpen,
  onClose,
  onSelectToken,
  playerLevel,
}: TokenSelectorProps) {
  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null)
  const [stakeAmount, setStakeAmount] = useState("1")
  const [showStakeInput, setShowStakeInput] = useState(false)

  const availableTokens = TOKEN_TYPES.filter((token) => playerLevel >= token.unlockLevel)

  const generateTokenPattern = (color: string, rarity: string) => {
    const lineCount = rarity === "legendary" ? 24 : rarity === "epic" ? 18 : rarity === "rare" ? 12 : 8
    const lines = []

    for (let i = 0; i < lineCount; i++) {
      const height = Math.random() * 50 + 15
      const left = (i / lineCount) * 100
      const opacity = rarity === "legendary" ? 0.9 : rarity === "epic" ? 0.7 : rarity === "rare" ? 0.6 : 0.5

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
            duration: 0.8,
            delay: i * 0.02,
            ease: [0.4, 0, 0.2, 1],
          }}
        />,
      )
    }
    return lines
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "border-orange-400 shadow-orange-500/30"
      case "epic":
        return "border-purple-400 shadow-purple-500/30"
      case "rare":
        return "border-blue-400 shadow-blue-500/30"
      default:
        return "border-gray-300 shadow-gray-500/20"
    }
  }

  const handleTokenSelect = (token: TokenType) => {
    setSelectedToken(token)
    setStakeAmount("1")
    setShowStakeInput(true)
  }

  const handlePlant = () => {
    if (selectedToken) {
      const amount = parseInt(stakeAmount) || 1
      onSelectToken(selectedToken, amount)
      setSelectedToken(null)
      setStakeAmount("1")
      setShowStakeInput(false)
    }
  }

  const handleClose = () => {
    setSelectedToken(null)
    setStakeAmount("1")
    setShowStakeInput(false)
    onClose()
  }

  const getTotalCost = () => {
    if (!selectedToken) return 0
    const amount = parseInt(stakeAmount) || 1
    return selectedToken.cost * amount
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-lg p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <motion.h2
                className="text-lg font-semibold text-gray-900"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {showStakeInput ? "Stake Amount" : "Select Token"}
              </motion.h2>
              <motion.button
                onClick={handleClose}
                className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-sm flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-3 h-3 bg-gray-600 rounded-sm" />
              </motion.button>
            </div>



            {!showStakeInput ? (
              /* Token Selection */
              <div className="grid grid-cols-1 gap-3">
                {availableTokens.map((token, index) => {
                  return (
                    <motion.button
                      key={token.id}
                      onClick={() => handleTokenSelect(token)}
                      className={`
                        relative p-3 rounded-sm border-2 transition-all duration-200
                        ${getRarityBorder(token.rarity)} hover:shadow-lg cursor-pointer
                      `}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Token Visual */}
                        <div className="relative w-12 h-12 bg-gray-50 rounded-sm overflow-hidden">
                          {generateTokenPattern(token.color, token.rarity)}
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm"
                            style={{ backgroundColor: token.color }}
                            animate={{
                              width: token.rarity === "legendary" ? "18px" : token.rarity === "epic" ? "16px" : "12px",
                              height: token.rarity === "legendary" ? "18px" : token.rarity === "epic" ? "16px" : "12px",
                            }}
                          />
                        </div>

                        {/* Token Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{token.name}</h3>
                            <span
                              className={`
                              px-2 py-0.5 text-xs rounded-sm font-medium
                              ${
                                token.rarity === "legendary"
                                  ? "bg-orange-100 text-orange-800"
                                  : token.rarity === "epic"
                                    ? "bg-purple-100 text-purple-800"
                                    : token.rarity === "rare"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                              }
                            `}
                            >
                              {token.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{token.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Cost: {token.cost} tokens</span>
                            <span>Growth: {Math.floor(token.growthTime / 1000)}s</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              /* Stake Amount Input */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Selected Token Display */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-gray-50 rounded-sm overflow-hidden">
                      {selectedToken && generateTokenPattern(selectedToken.color, selectedToken.rarity)}
                      {selectedToken && (
                        <motion.div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm"
                          style={{ backgroundColor: selectedToken.color }}
                          animate={{
                            width: selectedToken.rarity === "legendary" ? "18px" : selectedToken.rarity === "epic" ? "16px" : "12px",
                            height: selectedToken.rarity === "legendary" ? "18px" : selectedToken.rarity === "epic" ? "16px" : "12px",
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{selectedToken?.name}</h3>
                      <p className="text-xs text-gray-600">Cost per token: {selectedToken?.cost} tokens</p>
                    </div>
                  </div>
                </div>

                {/* Stake Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Amount to stake:</label>
                  <input
                    type="number"
                    min="1"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500">Min: 1</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowStakeInput(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlant}
                    className="flex-1 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Plant
                  </button>
                </div>
              </motion.div>
            )}

            {/* Locked Tokens Info */}
            {!showStakeInput && TOKEN_TYPES.length > availableTokens.length && (
              <motion.div
                className="mt-4 p-2 bg-gray-50 rounded-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-gray-600 text-center">
                  {TOKEN_TYPES.length - availableTokens.length} more tokens unlock as you level up!
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
