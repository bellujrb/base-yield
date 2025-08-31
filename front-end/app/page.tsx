"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  Badge,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TokenFarmGame from "../components/token-farm-game";
import Home from "../components/token-farm-game";

// Login Screen Component
function LoginScreen() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-md mx-auto px-4 py-3 flex flex-col justify-center min-h-screen">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <span className="text-white font-bold text-3xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Base Yield</h1>
          <p className="text-gray-600">DeFi Token Farming on Base</p>
        </div>

        {/* Login Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Connect Your Wallet</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              To access the Base token farm, you need to connect your wallet.
            </p>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex justify-center">
            <Wallet>
              <ConnectWallet className="w-full">
                <div className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 text-center">
                  Connect Wallet
                </div>
              </ConnectWallet>
            </Wallet>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <span className="text-xs text-gray-500">Powered by Base</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Onboarding Component inspired by Base Plot Design
function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [plotAnimations, setPlotAnimations] = useState<number[]>([]);

  const steps = [
    {
      title: "Plant Your Tokens",
      description: "Deposit tokens as seeds in our DeFi farm",
      visual: "plant",
      color: "#0052ff",
      stage: 1
    },
    {
      title: "Watch Them Grow",
      description: "Your tokens generate yield automatically over time",
      visual: "grow",
      color: "#22c55e",
      stage: 3
    },
    {
      title: "Harvest USDC",
      description: "Receive real rewards in USDC when ready",
      visual: "harvest",
      color: "#f59e0b",
      stage: 4
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  // Generate vertical lines like in Plot component
  const generateVerticalLines = (stage: number, ready: boolean, color: string) => {
    const lines = [];
    const lineCount = Math.min(stage * 8, 24);
    
    for (let i = 0; i < lineCount; i++) {
      const height = Math.random() * 60 + 20;
      const left = (i / lineCount) * 100;
      const opacity = ready ? 0.9 : 0.3 + (stage / 4) * 0.5;

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
        />
      );
    }
    return lines;
  };

  const renderPlotVisual = (step: any, index: number) => {
    const isReady = step.stage === 4;
    
    return (
      <motion.div
        key={index}
        className={`
          w-32 h-32 relative cursor-pointer overflow-hidden
          bg-white border border-gray-200 rounded-sm
          transition-all duration-200
          ${isReady ? "shadow-lg shadow-green-500/20 border-green-400" : "shadow-md"}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
        layout
      >
        {/* Grid background like Plot */}
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

        {/* Vertical lines animation */}
        <div className="absolute inset-0">
          {generateVerticalLines(step.stage, isReady, step.color)}
        </div>

        {/* Center token/plant */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            rotate: isReady ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.24,
            rotate: { duration: 2, repeat: isReady ? Infinity : 0 },
          }}
        >
          <motion.div
            className="rounded-sm"
            style={{
              backgroundColor: step.color,
            }}
            animate={{
              width: `${12 + step.stage * 4}px`,
              height: `${12 + step.stage * 4}px`,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </motion.div>

        {/* Ready state glow */}
        {isReady && (
          <motion.div
            className="absolute inset-0 border-2 border-green-500 rounded-sm"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* Token count badge */}
        {step.stage > 1 && (
          <motion.div
            className="absolute top-2 left-2 text-white px-1.5 py-0.5 rounded-sm text-xs font-medium flex items-center gap-1"
            style={{ backgroundColor: step.color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-sm opacity-80" />
            {step.stage}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Base header */}
      <motion.div 
        className="absolute top-6 left-6 flex items-center space-x-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div 
          className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center shadow-md"
          whileHover={{ scale: 1.1, rotate: 3 }}
          transition={{ duration: 0.12 }}
        >
          <span className="text-white font-bold text-sm">B</span>
        </motion.div>
        <span className="font-bold text-gray-800">Base Yield</span>
      </motion.div>

      {/* Progress plots */}
      <motion.div 
        className="flex space-x-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.1 }}
      >
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`w-6 h-6 rounded-sm transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              index <= currentStep ? 'shadow-md' : 'opacity-30'
            }`}
            style={{
              backgroundColor: index <= currentStep ? step.color : '#d1d5db'
            }}
            animate={{
              scale: index === currentStep ? 1.2 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </motion.div>

      {/* Main plot visual */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        key={currentStep}
      >
        {renderPlotVisual(currentStepData, currentStep)}
      </motion.div>

      {/* Content */}
      <motion.div 
        className="text-center max-w-sm mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.3 }}
        key={`content-${currentStep}`}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {currentStepData.title}
        </h2>
        <p className="text-gray-600 leading-relaxed">
          {currentStepData.description}
        </p>
      </motion.div>

      {/* Action button */}
      <motion.button
         onClick={nextStep}
         disabled={isAnimating}
         className="px-8 py-3 rounded-sm text-white font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
         whileHover={{ scale: 1.02, y: -1 }}
         whileTap={{ scale: 0.98 }}
         transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
       >
        {currentStep < steps.length - 1 ? 'Next' : 'Start Planting'}
      </motion.button>

      {/* Base branding */}
      <motion.div 
        className="absolute bottom-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.24, delay: 0.5 }}
      >
        <p className="text-xs text-gray-500 mb-2">Built on Base blockchain</p>
        <div className="flex items-center justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-sm"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(true);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          onClick={handleAddFrame}
          className="text-white px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium"
        >
          Save Frame
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-blue-600">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  const renderContent = () => {
    switch (activeTab) {
      default:
        return <Home />;
    }
  };

  // Show login screen if wallet is not connected
  if (!isConnected || !address) {
    return <LoginScreen />;
  }

  // Show onboarding first for connected users
  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  // Check if current tab needs bottom navigation padding
  const needsBottomPadding = activeTab === "token-farm";

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        {/* Enhanced header with Base-inspired design */}
        <header className="flex justify-between items-center mb-6 py-4 relative z-[9999]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Base Yield</h1>
              <p className="text-xs text-gray-500">DeFi Token Farming</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Wallet className="z-[10000] relative">
              <ConnectWallet>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <Name className="text-gray-700 text-sm font-medium" />
                </div>
              </ConnectWallet>
              <WalletDropdown className="z-[10000]">
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
            {saveFrameButton}
          </div>
        </header>

        <main className={`flex-1 ${needsBottomPadding ? "pb-20" : ""}`}>
          {renderContent()}
        </main>

        {/* Enhanced footer */}
        <footer className="mt-6 pt-4 flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <span className="text-xs text-gray-500">Powered by Base</span>
          </div>
          <button
            className="text-gray-400 text-xs hover:text-blue-600 transition-colors duration-200"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built with MiniKit
          </button>
        </footer>
      </div>
    </div>
  );
}
