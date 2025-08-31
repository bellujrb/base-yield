"use client"

import { motion } from "framer-motion"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
      { id: "harvest", label: "Harvest" },
      { id: "transactions", label: "Transactions" },
      { id: "ranking", label: "Ranking" },
    ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? "text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <motion.div
                className={`w-2 h-2 rounded-sm transition-colors duration-200 ${
                  isActive ? "bg-blue-500" : "bg-gray-400"
                }`}
                animate={{
                  scale: isActive ? 1 : 0.8,
                }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
