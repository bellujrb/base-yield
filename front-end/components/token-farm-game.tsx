"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Transaction } from '@coinbase/onchainkit/transaction'
import GameHeader from "./game-header"
import FarmGrid from "./farm-grid"
import Notification from "./notification"
import HarvestCelebration from "./harvest-celebration"
import BottomNavigation from "./bottom-navigation"
import RankingScreen from "./ranking-screen"
import TransactionsScreen from "./transactions-screen"
import { useFarmContractOnchain } from "../hooks/use-farm-contract-onchain"
import type { TokenType } from "./token-selector"

export interface Plot {
  planted: boolean
  stakedAmount: number // Em ETH
  plantTime: number
  harvestTime: number
  growthStage: number
  growthProgress: number
  ready: boolean
  isActive: boolean
  isHarvested: boolean
  farmId?: number
}

export interface GameState {
  experience: number
  tokens: number
  level: number
  plots: Plot[]
}

interface TransactionState {
  type: 'stake' | 'harvest' | null
  plotIndex?: number
  amount?: string
  farmId?: number
}

interface HomeProps {
  onBackToHome?: () => void
}

export default function Home({ onBackToHome }: HomeProps) {
  const {
    farms,
    userData,
    loading,
    error,
    getStakeCalls,
    getHarvestCalls,
    refreshData,
    canHarvest,
    getGrowthProgress,
    getGrowthStage,
    isConnected,
  } = useFarmContractOnchain()

  const [gameState, setGameState] = useState<GameState>({
    experience: 0,
    tokens: 50,
    level: 1,
    plots: Array(12)
      .fill(null)
      .map((_, index) => {
        // Criar 2 plots mockados prontos para coleta (índices 0 e 1)
        if (index === 0 || index === 1) {
          const now = Date.now()
          return {
            planted: true,
            stakedAmount: 0.1, // 0.1 ETH mockado
            plantTime: now - 300000, // 5 minutos atrás
            harvestTime: now - 60000, // 1 minuto atrás (já pronto)
            growthStage: 4,
            growthProgress: 100,
            ready: true,
            isActive: true,
            isHarvested: false,
            farmId: 999 + index, // IDs mockados
          }
        }
        return {
          planted: false,
          stakedAmount: 0,
          plantTime: 0,
          harvestTime: 0,
          growthStage: 0,
          growthProgress: 0,
          ready: false,
          isActive: false,
          isHarvested: false,
          farmId: undefined,
        }
      }),
  })

  const [notification, setNotification] = useState<string | null>(null)
  const [collectionAnimation, setCollectionAnimation] = useState<{ index: number; tokens: number } | null>(null)
  const [harvestCelebration, setHarvestCelebration] = useState<{
    isOpen: boolean
    data: {
      tokenType: TokenType
      tokensHarvested: number
      coinsEarned: number
      experienceGained: number
    } | null
  }>({
    isOpen: false,
    data: null,
  })

  const [activeTab, setActiveTab] = useState("harvest")
  const [transactionState, setTransactionState] = useState<TransactionState>({ type: null })

  const showNotification = useCallback((message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const checkLevelUp = useCallback(() => {
    setGameState((prev) => {
      const requiredExp = prev.level * 100
      if (prev.experience >= requiredExp) {
        showNotification(`Level ${prev.level + 1}! +10💎 bonus!`)
        return {
          ...prev,
          level: prev.level + 1,
          tokens: prev.tokens + 10,
        }
      }
      return prev
    })
  }, [showNotification])

  const plantToken = useCallback(
    (index: number, tokenType: TokenType, stakeAmount: number) => {
      if (!isConnected) {
        showNotification("Please connect your wallet first!")
        return
      }

      // Usar o valor do stakeAmount diretamente
      const amount = stakeAmount.toString()
      
      setTransactionState({
        type: 'stake',
        plotIndex: index,
        amount: amount,
      })
    },
    [isConnected, showNotification],
  )

  const stackTokens = useCallback(
    (index: number) => {
      const plot = gameState.plots[index]
      if (!plot.farmId) {
        return
      }

      // Para stack, vamos usar o valor atual stakeado
      const amount = plot.stakedAmount.toString()
      
      setTransactionState({
        type: 'stake',
        plotIndex: index,
        amount: amount,
      })
    },
    [gameState.plots],
  )

  const harvestPlot = useCallback(
    (index: number) => {
      const plot = gameState.plots[index]
      if (!plot.ready || !plot.farmId) return

      // Para plots mockados (farmId 999 ou 1000), usar lógica mockada
      if (plot.farmId === 999 || plot.farmId === 1000) {
        setTransactionState({
          type: 'harvest',
          plotIndex: index,
          farmId: plot.farmId,
        })
        return
      }

      if (!canHarvest(plot.farmId)) {
        showNotification("This farm is not ready for harvest yet!")
        return
      }

      setTransactionState({
        type: 'harvest',
        plotIndex: index,
        farmId: plot.farmId,
      })
    },
    [gameState.plots, canHarvest, showNotification],
  )

  const handlePlotClick = useCallback(
    (index: number) => {
      const plot = gameState.plots[index]

      if (plot.planted && !plot.ready) {
        stackTokens(index)
      } else if (plot.ready) {
        harvestPlot(index)
      }
    },
    [gameState.plots, stackTokens, harvestPlot],
  )

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case "transactions":
        return <TransactionsScreen />
      case "ranking":
        return (
          <RankingScreen currentPlayer={{ level: gameState.level, tokens: gameState.tokens }} />
        )
      default:
        return (
          <div>
            <GameHeader gameState={gameState} />

            <FarmGrid
              plots={gameState.plots}
              onPlotClick={handlePlotClick}
              onPlantToken={plantToken}
              collectionAnimation={collectionAnimation}
              getStakeCalls={getStakeCalls}
              onTransactionSuccess={onTransactionSuccess}
              onTransactionError={onTransactionError}
            />
          </div>
        )
    }
  }

  // Sincronizar farms do contrato com plots locais
  useEffect(() => {
    if (farms && farms.length > 0) {
      setGameState((prev) => {
        const newPlots = [...prev.plots]
        
        farms.forEach((farm, index) => {
          if (index < newPlots.length && farm.isActive && !farm.isHarvested) {
            const progress = getGrowthProgress(farm)
            const stage = getGrowthStage(farm)
            
            const stakedAmountValue = Number(farm.stakedAmount) / 1000000000000000000
            
            newPlots[index] = {
              ...newPlots[index],
              planted: true,
              stakedAmount: 2, // Se NaN, usar 2
              plantTime: Number(farm.plantTime) * 1000, // Converter para ms
              harvestTime: Number(farm.harvestTime) * 1000,
              growthStage: stage,
              growthProgress: progress,
              ready: canHarvest(farm.farmId),
              isActive: farm.isActive,
              isHarvested: farm.isHarvested,
              farmId: farm.farmId,
            }
          }
        })
        
        return { ...prev, plots: newPlots }
      })
    }
  }, [farms, getGrowthProgress, getGrowthStage, canHarvest])

  // Atualizar dados do usuário
  useEffect(() => {
    if (userData) {
      const levelValue = Number(userData.level)
      
      setGameState((prev) => ({
        ...prev,
        experience: Number(userData.totalXP),
        level: isNaN(levelValue) ? 1 : levelValue, // Se NaN, usar 1
        tokens: Number(userData.totalRewards) / 1000000, // Converter de wei
      }))
    }
  }, [userData])

  // Callbacks para o Transaction component
  const onTransactionSuccess = useCallback(() => {
    // Para transações de harvest mockadas, mostrar ganho de USDC
    if (transactionState.type === 'harvest' && 
        (transactionState.farmId === 999 || transactionState.farmId === 1000)) {
      showNotification("Harvest successful! You earned 50 USDC! 💰")
      
      // Marcar o plot como colhido
      if (transactionState.plotIndex !== undefined) {
        setGameState(prev => {
          const newPlots = [...prev.plots]
          newPlots[transactionState.plotIndex!] = {
            ...newPlots[transactionState.plotIndex!],
            ready: false,
            planted: false,
            isHarvested: true,
          }
          return {
            ...prev,
            plots: newPlots,
            tokens: prev.tokens + 50, // Adicionar 50 tokens como USDC
          }
        })
      }
    } else {
      showNotification("Transaction successful! 🎉")
      // Refresh data after successful transaction
      setTimeout(() => {
        refreshData()
      }, 2000)
    }
    
    setTransactionState({ type: null })
  }, [showNotification, refreshData, transactionState])

  const onTransactionError = useCallback((error: any) => {
    showNotification(`Transaction failed: ${error.message || 'Unknown error'}`)
    setTransactionState({ type: null })
  }, [showNotification])

  // Obter calls para a transação atual
  const getCurrentTransactionCalls = useCallback(() => {
    if (!transactionState.type) return []
    
    if (transactionState.type === 'stake' && transactionState.amount) {
      return getStakeCalls(transactionState.amount)
    }
    
    if (transactionState.type === 'harvest' && transactionState.farmId !== undefined) {
      // Para plots mockados, retornar call mockado com valor 0
      if (transactionState.farmId === 999 || transactionState.farmId === 1000) {
        return [{
          to: '0x0000000000000000000000000000000000000000' as `0x${string}`,
          data: '0x' as `0x${string}`,
          value: BigInt(0), // 0 ETH
        }]
      }
      return getHarvestCalls(transactionState.farmId)
    }
    
    return []
  }, [transactionState, getStakeCalls, getHarvestCalls])

  return (
    <div className="w-full">
      {renderCurrentScreen()}

      {notification && <Notification message={notification} />}

      <HarvestCelebration
        isOpen={harvestCelebration.isOpen}
        onClose={() => setHarvestCelebration({ isOpen: false, data: null })}
        harvestData={harvestCelebration.data}
      />



      {/* Bottom Navigation - Fixed at bottom */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Transaction Component para processar transações mockadas */}
      {transactionState.type && (
        <Transaction
          chainId={84532} // Base Sepolia
          calls={getCurrentTransactionCalls()}
          onSuccess={onTransactionSuccess}
          onError={onTransactionError}
        />
      )}
    </div>
  )
}
