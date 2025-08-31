"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { parseEther } from "viem";
import type { ContractFunctionParameters } from "viem";
import TokenFarmManagerABI from "../abi/TokenFarmManager.json";

const ABI = TokenFarmManagerABI.abi || TokenFarmManagerABI;

// Endereço do contrato TokenFarmManager
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_FARM_CONTRACT_ADDRESS || "0x3654cadc3c65a6c0a47bb785eac90e9d21b194a8") as `0x${string}`;

export interface Farm {
  farmId: number;
  stakedAmount: bigint;
  plantTime: bigint;
  harvestTime: bigint;
  growthStage: bigint;
  growthProgress: bigint;
  isActive: boolean;
  isHarvested: boolean;
}

export interface UserData {
  totalXP: bigint;
  level: bigint;
  totalHarvests: bigint;
  totalStaked: bigint;
  totalRewards: bigint;
}

export function useFarmContractOnchain() {
  const { address } = useAccount();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar farms do usuário
  const { data: userFarmsData, refetch: refetchUserFarms } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getUserFarms",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Buscar dados do usuário
  const { data: userData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "userData",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Buscar farms que podem ser colhidas
  const { data: harvestableFarmsData, refetch: refetchHarvestableFarms } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getHarvestableFarms",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Processar dados das farms quando recebidos
  useEffect(() => {
    if (userFarmsData && Array.isArray(userFarmsData) && userFarmsData.length >= 2) {
      const [farmIds, farmsData] = userFarmsData as [bigint[], any[]];
      
      const processedFarms: Farm[] = farmIds.map((farmId, index) => {
        const farmData = farmsData[index];
        return {
          farmId: Number(farmId),
          stakedAmount: farmData.stakedAmount,
          plantTime: farmData.plantTime,
          harvestTime: farmData.harvestTime,
          growthStage: farmData.growthStage,
          growthProgress: farmData.growthProgress,
          isActive: farmData.isActive,
          isHarvested: farmData.isHarvested,
        };
      });
      
      setFarms(processedFarms);
    }
  }, [userFarmsData]);

  // Função para criar chamadas de stake para o Transaction component
  const getStakeCalls = useCallback((amount: string): ContractFunctionParameters[] => {
    if (!address) return [];
    
    // Validar se o amount é um número decimal válido
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error("Invalid amount for staking:", amount);
      return [];
    }
    
    // Converter para string com formato decimal válido
    const validAmount = numericAmount.toString();
    
    return [
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "stake",
        args: [],
        value: parseEther(validAmount),
      } as ContractFunctionParameters,
    ];
  }, [address]);

  // Função para criar chamadas de harvest para o Transaction component
  const getHarvestCalls = useCallback((farmId: number): ContractFunctionParameters[] => {
    if (!address) return [];
    
    return [
      {
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "harvest",
        args: [BigInt(farmId)],
      } as ContractFunctionParameters,
    ];
  }, [address]);

  // Função para atualizar dados após transação
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        refetchUserFarms(),
        refetchHarvestableFarms(),
      ]);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
      setError("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
  }, [refetchUserFarms, refetchHarvestableFarms]);

  // Função para verificar se uma farm pode ser colhida
  const canHarvest = useCallback((farmId: number) => {
    if (!harvestableFarmsData || !Array.isArray(harvestableFarmsData) || harvestableFarmsData.length < 1) {
      return false;
    }
    
    const [harvestableFarmIds] = harvestableFarmsData as [bigint[]];
    return harvestableFarmIds.some(id => Number(id) === farmId);
  }, [harvestableFarmsData]);

  // Função para obter o progresso de crescimento
  const getGrowthProgress = useCallback((farm: Farm) => {
    if (!farm.isActive || farm.isHarvested) return 100;
    
    const now = BigInt(Math.floor(Date.now() / 1000));
    const elapsed = now - farm.plantTime;
    const totalTime = farm.harvestTime - farm.plantTime;
    
    if (totalTime <= BigInt(0)) return 0;
    
    const progress = Number((elapsed * BigInt(100)) / totalTime);
    return Math.min(Math.max(progress, 0), 100);
  }, []);

  // Função para obter o estágio de crescimento
  const getGrowthStage = useCallback((farm: Farm) => {
    const progress = getGrowthProgress(farm);
    
    if (progress < 25) return 1;
    if (progress < 50) return 2;
    if (progress < 75) return 3;
    if (progress < 100) return 4;
    return 5; // Pronto para colher
  }, [getGrowthProgress]);

  return {
    // Dados
    farms,
    userData: userData as UserData | undefined,
    loading,
    error,
    
    // Funções para criar chamadas de transação para Transaction component
    getStakeCalls,
    getHarvestCalls,
    
    // Funções utilitárias
    refreshData,
    canHarvest,
    getGrowthProgress,
    getGrowthStage,
    
    // Estado da conexão
    isConnected: !!address,
    address,
  };
}