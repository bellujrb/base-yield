"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import GameHeader from "./game-header"
import FarmGrid from "./farm-grid"
import Notification from "./notification"
import HarvestCelebration from "./harvest-celebration"
import BottomNavigation from "./bottom-navigation"
import RankingScreen from "./ranking-screen"
import TransactionsScreen from "./transactions-screen"
import type { TokenType } from "./token-selector"

export interface Plot {
  planted: boolean
  tokenCount: number
  plantTime: number
  growthTime: number
  stage: number
  ready: boolean
  plantType: string
  tokenType?: TokenType
}

export interface GameState {
  experience: number
  tokens: number
  level: number
  plots: Plot[]
}

interface HomeProps {
  onBackToHome?: () => void
}

export default function Home({ onBackToHome }: HomeProps) {
  const [gameState, setGameState] = useState<GameState>({
    experience: 0,
    tokens: 50,
    level: 1,
    plots: Array(12)
      .fill(null)
      .map(() => ({
        planted: false,
        tokenCount: 0,
        plantTime: 0,
        growthTime: 30000,
        stage: 0,
        ready: false,
        plantType: "token",
        tokenType: undefined,
      })),
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
    (index: number, tokenType: TokenType) => {
      setGameState((prev) => ({
        ...prev,
        experience: prev.experience + 10,
        plots: prev.plots.map((plot, i) =>
          i === index
            ? {
                ...plot,
                planted: true,
                tokenCount: 1,
                plantTime: Date.now(),
                stage: 1,
                growthTime: tokenType.growthTime,
                tokenType: tokenType,
              }
            : plot,
        ),
      }))

      showNotification(`${tokenType.name} planted! 🌱`)
    },
    [showNotification],
  )

  const stackTokens = useCallback(
    (index: number) => {
      const plot = gameState.plots[index]
      if (!plot.tokenType) {
        return
      }

      setGameState((prev) => ({
        ...prev,
        plots: prev.plots.map((p, i) => {
          if (i === index) {
            const newTokenCount = p.tokenCount + 1
            const reduction = p.growthTime * 0.2
            const newGrowthTime = Math.max(p.growthTime - reduction, 5000)
            return { ...p, tokenCount: newTokenCount, growthTime: newGrowthTime }
          }
          return p
        }),
      }))

      const newTokenCount = gameState.plots[index].tokenCount + 1
      showNotification(`+1 ${plot.tokenType.name} stacked! Total: ${newTokenCount} 💎`)
    },
    [gameState.plots, showNotification],
  )

  const harvestPlot = useCallback(
    (index: number) => {
      const plot = gameState.plots[index]
      if (!plot.ready || !plot.tokenType) return

      const tokenReward = plot.tokenCount
      const expReward = tokenReward * 5

      setCollectionAnimation({ index, tokens: tokenReward })
      setTimeout(() => setCollectionAnimation(null), 600)

      setHarvestCelebration({
        isOpen: true,
        data: {
          tokenType: plot.tokenType,
          tokensHarvested: tokenReward,
          coinsEarned: 0,
          experienceGained: expReward,
        },
      })

      setGameState((prev) => ({
        ...prev,
        tokens: prev.tokens + tokenReward,
        experience: prev.experience + expReward,
        plots: prev.plots.map((p, i) =>
          i === index
            ? { ...p, planted: false, tokenCount: 0, plantTime: 0, stage: 0, ready: false, tokenType: undefined }
            : p,
        ),
      }))

      checkLevelUp()
    },
    [gameState.plots, checkLevelUp],
  )

  const handlePlotClick = useCallback(
    (index: number) => {
      const plot = gameState.plots[index]

      if (plot.planted && !plot.ready && plot.tokenType) {
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
              playerLevel={gameState.level}
            />
          </div>
        )
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        plots: prev.plots.map((plot) => {
          if (!plot.planted) return plot

          const elapsed = Date.now() - plot.plantTime
          const progress = Math.min(elapsed / plot.growthTime, 1)

          let newStage = plot.stage
          let ready = false

          if (progress < 0.33) {
            newStage = 1
          } else if (progress < 0.66) {
            newStage = 2
          } else if (progress < 1) {
            newStage = 3
          } else {
            newStage = 4
            ready = true
          }

          return { ...plot, stage: newStage, ready }
        }),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

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
    </div>
  )
}
