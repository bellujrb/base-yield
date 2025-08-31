"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Transaction } from '@coinbase/onchainkit/transaction'
import type { ContractFunctionParameters } from 'viem'
import { parseUnits, formatUnits } from 'viem'

// Função para normalizar input do usuário (vírgula para ponto)
const normalizeInput = (value: string): string => {
  return value.replace(',', '.')
}

// Função para converter input do usuário para wei de forma segura
const safeParseEth = (input: string): bigint => {
  try {
    const normalized = normalizeInput(input)
    return parseUnits(normalized, 18) // 18 decimais para ETH
  } catch {
    throw new Error('Valor inválido')
  }
}

// Função para converter wei de volta para display
const formatEthForDisplay = (weiValue: bigint): string => {
  return formatUnits(weiValue, 18)
}

export interface TokenType {
  id: string
  name: string
}

export const TOKEN_TYPES: TokenType[] = [
  {
    id: "eth",
    name: "BASE",
  },
]

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (tokenType: TokenType, stakeAmount: number) => void
  getStakeCalls: (amount: string) => ContractFunctionParameters[]
  onTransactionSuccess: () => void
  onTransactionError: (error: unknown) => void
}

export default function TokenSelector({
  isOpen,
  onClose,
  onSelectToken,
  getStakeCalls,
  onTransactionSuccess,
  onTransactionError,
}: TokenSelectorProps) {
  const [selectedToken, setSelectedToken] = useState<TokenType | null>(null)
  const [stakeAmount, setStakeAmount] = useState("1")
  const [showStakeInput, setShowStakeInput] = useState(false)
  const [showTransaction, setShowTransaction] = useState(false)

  const availableTokens = TOKEN_TYPES // Todos os tokens estão sempre disponíveis

  // Padrão visual simples para ETH
  const generateEthPattern = () => {
    const lines = []
    for (let i = 0; i < 8; i++) {
      const height = Math.random() * 50 + 15
      const left = (i / 8) * 100
      lines.push(
        <motion.div
          key={i}
          className="absolute bottom-0 w-0.5 rounded-full bg-blue-500"
          style={{
            left: `${left}%`,
            opacity: 0.6,
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

  const handleTokenSelect = (token: TokenType) => {
    setSelectedToken(token)
    setStakeAmount("0.0001")
    setShowStakeInput(true)
  }

  const handlePlant = () => {
    if (selectedToken) {
      setShowTransaction(true)
    }
  }

  const handleTransactionSuccess = () => {
    if (selectedToken) {
      const amount = parseFloat(stakeAmount) || 0.0001
      onSelectToken(selectedToken, amount)
      setSelectedToken(null)
      setStakeAmount("0.0001")
      setShowStakeInput(false)
      setShowTransaction(false)
      onTransactionSuccess()
    }
  }

  const handleTransactionError = (error: unknown) => {
    setShowTransaction(false)
    onTransactionError(error)
  }

  const getCurrentStakeCalls = () => {
    if (!selectedToken) return []
    try {
      // Usar conversão segura para wei e depois de volta para string
      const weiValue = safeParseEth(stakeAmount || "0.0001")
      const amountInEther = formatEthForDisplay(weiValue)
      return getStakeCalls(amountInEther)
    } catch {
      // Fallback para valor mínimo em caso de erro
      const fallbackWei = parseUnits("0.0001", 18)
      const fallbackAmount = formatEthForDisplay(fallbackWei)
      return getStakeCalls(fallbackAmount)
    }
  }

  const handleClose = () => {
    setSelectedToken(null)
    setStakeAmount("0.0001")
    setShowStakeInput(false)
    onClose()
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
                      className="relative p-3 rounded-sm border-2 border-blue-400 shadow-blue-500/30 hover:shadow-lg cursor-pointer transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Token Visual */}
                        <div className="relative w-12 h-12 bg-gray-50 rounded-sm overflow-hidden">
                          {generateEthPattern()}
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-blue-500"
                            animate={{
                              width: "16px",
                              height: "16px",
                            }}
                          />
                        </div>

                        {/* Token Info */}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 text-sm">{token.name}</h3>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Stake Base to earn rewards</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Min: 0.0001 BASE</span>
                            <span>Growth: 24h</span>
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
                      {selectedToken && generateEthPattern()}
                      {selectedToken && (
                        <motion.div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-blue-500"
                          animate={{
                            width: "16px",
                            height: "16px",
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{selectedToken?.name}</h3>
                      <p className="text-xs text-gray-600">Stake Base to earn USDC rewards</p>
                    </div>
                  </div>
                </div>

                {/* Stake Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Amount to stake (ETH):</label>
                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(normalizeInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0001"
                  />
                  <p className="text-xs text-gray-500">Min: 0.0001 ETH</p>
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

                {/* Transaction component */}
                {showTransaction && (
                  <div className="mt-4">
                    <Transaction
                      chainId={84532}
                      calls={getCurrentStakeCalls()}
                      onSuccess={handleTransactionSuccess}
                      onError={handleTransactionError}
                    />
                  </div>
                )}
              </motion.div>
            )}


          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
