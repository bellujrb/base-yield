// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";

// Interface para o PaymentVault
interface IPaymentVault {
    function transferReward(address to, uint256 amount) external;
}

contract TokenFarmManager is Ownable {
    using SafeTransferLib for address;

    // Estrutura para representar uma plantação/stake
    struct Farm {
        uint256 stakedAmount;     // Quantidade de ETH stakeada
        uint256 plantTime;        // Timestamp quando foi plantado
        uint256 harvestTime;      // Timestamp quando pode ser colhido
        uint256 growthStage;      // Estágio de crescimento (0-3)
        uint256 growthProgress;   // Progresso de crescimento (0-100)
        bool isActive;            // Se a farm está ativa
        bool isHarvested;         // Se a farm já foi colhida
    }

    // Estrutura para dados do usuário
    struct UserData {
        uint256 totalXP;          // XP total acumulado
        uint256 level;            // Nível atual do usuário
        uint256 totalHarvests;    // Total de colheitas realizadas
        uint256 totalStaked;      // Total já stakeado pelo usuário
        uint256 totalRewards;     // Total de rewards recebidos    
    }

    // Enums para estágios de crescimento
    enum GrowthStage {
        Stage1,    // 0-33%
        Stage2,    // 33-66%
        Stage3,    // 66-100%
        Stage4     // 100% - Pronto para colheita
    }

    // Constantes do sistema
    uint256 public constant GROWTH_PERIOD = 24 hours;  // Período total de crescimento
    uint256 public constant BASE_YIELD_RATE = 105;     // 5% de yield base (105/100)
    uint256 public constant XP_PER_HARVEST = 100;      // XP ganho por colheita
    uint256 public constant LEVEL_XP_THRESHOLD = 1000; // XP necessário por nível

    // Variáveis de estado
    address public immutable usdcToken;               // Endereço do token USDC
    address public paymentVault;                      // Endereço do PaymentVault
    uint256 public farmCounter;                       // Contador de farms
    uint256 public totalValueLocked;                  // Total de ETH locked no contrato
    uint256 public totalRewardsDistributed;           // Total de rewards distribuídos

    // Mappings
    mapping(address => mapping(uint256 => Farm)) public userFarms;     // user => farmId => Farm
    mapping(address => uint256[]) public userFarmIds;                  // user => array de farmIds
    mapping(address => UserData) public userData;                      // user => UserData
    mapping(address => uint256) public userFarmCount;                  // user => quantidade de farms

    // Events
    event Staked(address indexed user, uint256 indexed farmId, uint256 amount, uint256 harvestTime);
    event Harvested(address indexed user, uint256 indexed farmId, uint256 stakedAmount, uint256 reward, uint256 xpGained);
    event LevelUp(address indexed user, uint256 newLevel);
    event EmergencyWithdraw(address indexed user, uint256 indexed farmId, uint256 amount);

    // Modifiers
    modifier validFarm(address user, uint256 farmId) {
        require(farmId < userFarmCount[user], "TokenFarmManager: Invalid farm ID");
        require(userFarms[user][farmId].isActive, "TokenFarmManager: Farm not active");
        _;
    }

    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "TokenFarmManager: Invalid USDC token address");
        usdcToken = _usdcToken;
        _initializeOwner(msg.sender);
    }

    // Função para fazer stake (plantar)
    function stake() external payable {
        require(msg.value > 0, "TokenFarmManager: Must stake more than 0 ETH");
        
        uint256 farmId = userFarmCount[msg.sender];
        uint256 harvestTime = block.timestamp + GROWTH_PERIOD;
        
        // Criar nova farm
        userFarms[msg.sender][farmId] = Farm({
            stakedAmount: msg.value,
            plantTime: block.timestamp,
            harvestTime: harvestTime,
            growthStage: 0,
            growthProgress: 0,
            isActive: true,
            isHarvested: false
        });
        
        // Atualizar dados do usuário
        userFarmIds[msg.sender].push(farmId);
        userFarmCount[msg.sender]++;
        userData[msg.sender].totalStaked += msg.value;
        
        // Atualizar estatísticas globais
        totalValueLocked += msg.value;
        farmCounter++;
        
        emit Staked(msg.sender, farmId, msg.value, harvestTime);
    }

    // Função para colher (harvest)
    function harvest(uint256 farmId) external validFarm(msg.sender, farmId) {
        // Atualizar crescimento antes do harvest
        updateGrowth(msg.sender, farmId);
        
        Farm storage farm = userFarms[msg.sender][farmId];
        require(block.timestamp >= farm.harvestTime, "TokenFarmManager: Farm not ready for harvest");
        require(!farm.isHarvested, "TokenFarmManager: Farm already harvested");
        
        uint256 stakedAmount = farm.stakedAmount;
        uint256 reward = calculateReward(stakedAmount, msg.sender);
        
        // Marcar como colhida
        farm.isHarvested = true;
        farm.isActive = false;
        
        // Atualizar dados do usuário
        UserData storage user = userData[msg.sender];
        user.totalHarvests++;
        user.totalXP += XP_PER_HARVEST;
        user.totalRewards += reward;
        
        // Verificar level up
        uint256 newLevel = user.totalXP / LEVEL_XP_THRESHOLD;
        if (newLevel > user.level) {
            user.level = newLevel;
            emit LevelUp(msg.sender, newLevel);
        }
        
        // Atualizar estatísticas globais
        totalValueLocked -= stakedAmount;
        totalRewardsDistributed += reward;
        
        // Transferir ETH de volta para o usuário
        payable(msg.sender).transfer(stakedAmount);
        
        // Transferir reward em USDC através do PaymentVault
        if (reward > 0 && paymentVault != address(0)) {
            IPaymentVault(paymentVault).transferReward(msg.sender, reward);
        }
        
        emit Harvested(msg.sender, farmId, stakedAmount, reward, XP_PER_HARVEST);
    }

    // Função para calcular reward baseado no stake e nível do usuário
    function calculateReward(uint256 stakedAmount, address user) public view returns (uint256) {
        UserData memory userInfo = userData[user];
        
        // Yield base de 5%
        uint256 baseReward = (stakedAmount * (BASE_YIELD_RATE - 100)) / 100;
        
        // Bonus por nível (1% adicional por nível)
        uint256 levelBonus = (baseReward * userInfo.level) / 100;
        
        return baseReward + levelBonus;
    }

    // Função para atualizar o crescimento de uma farm
    function updateGrowth(address user, uint256 farmId) internal {
        Farm storage farm = userFarms[user][farmId];
        
        if (!farm.isActive || farm.isHarvested) {
            return;
        }
        
        uint256 elapsed = block.timestamp - farm.plantTime;
        uint256 progress = (elapsed * 100) / GROWTH_PERIOD;
        
        if (progress >= 100) {
            farm.growthProgress = 100;
            farm.growthStage = uint256(GrowthStage.Stage4);
        } else if (progress >= 66) {
            farm.growthProgress = progress;
            farm.growthStage = uint256(GrowthStage.Stage3);
        } else if (progress >= 33) {
            farm.growthProgress = progress;
            farm.growthStage = uint256(GrowthStage.Stage2);
        } else {
            farm.growthProgress = progress;
            farm.growthStage = uint256(GrowthStage.Stage1);
        }
    }
    
    // Função para obter o estágio atual de crescimento
    function getCurrentGrowthStage(address user, uint256 farmId) external view validFarm(user, farmId) returns (GrowthStage) {
        Farm memory farm = userFarms[user][farmId];
        
        if (block.timestamp >= farm.harvestTime) {
            return GrowthStage.Stage4;
        }
        
        uint256 elapsed = block.timestamp - farm.plantTime;
        uint256 progress = (elapsed * 100) / GROWTH_PERIOD;
        
        if (progress < 33) {
            return GrowthStage.Stage1;
        } else if (progress < 66) {
            return GrowthStage.Stage2;
        } else {
            return GrowthStage.Stage3;
        }
    }

    // Função para obter progresso percentual
    function getGrowthProgress(address user, uint256 farmId) external view validFarm(user, farmId) returns (uint256) {
        Farm memory farm = userFarms[user][farmId];
        
        if (block.timestamp >= farm.harvestTime) {
            return 100;
        }
        
        uint256 elapsed = block.timestamp - farm.plantTime;
        return (elapsed * 100) / GROWTH_PERIOD;
    }
    
    // Função para atualizar crescimento de uma farm específica (externa)
    function updateFarmGrowth(uint256 farmId) external validFarm(msg.sender, farmId) {
        updateGrowth(msg.sender, farmId);
    }

    // Função para obter todas as farms de um usuário
    function getUserFarms(address user) external view returns (uint256[] memory farmIds, Farm[] memory farms) {
        uint256 count = userFarmCount[user];
        farmIds = new uint256[](count);
        farms = new Farm[](count);
        
        for (uint256 i = 0; i < count; i++) {
            farmIds[i] = i;
            farms[i] = userFarms[user][i];
        }
    }

    // Função para obter farms ativas de um usuário
    function getActiveFarms(address user) external view returns (uint256[] memory farmIds, Farm[] memory farms) {
        uint256 count = userFarmCount[user];
        uint256 activeCount = 0;
        
        // Contar farms ativas
        for (uint256 i = 0; i < count; i++) {
            if (userFarms[user][i].isActive) {
                activeCount++;
            }
        }
        
        farmIds = new uint256[](activeCount);
        farms = new Farm[](activeCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < count; i++) {
            if (userFarms[user][i].isActive) {
                farmIds[index] = i;
                farms[index] = userFarms[user][i];
                index++;
            }
        }
    }

    // Função para obter farms prontas para colheita
    function getHarvestableFarms(address user) external view returns (uint256[] memory farmIds, Farm[] memory farms) {
        uint256 count = userFarmCount[user];
        uint256 harvestableCount = 0;
        
        // Contar farms prontas para colheita
        for (uint256 i = 0; i < count; i++) {
            Farm memory farm = userFarms[user][i];
            if (farm.isActive && !farm.isHarvested && block.timestamp >= farm.harvestTime) {
                harvestableCount++;
            }
        }
        
        farmIds = new uint256[](harvestableCount);
        farms = new Farm[](harvestableCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < count; i++) {
            Farm memory farm = userFarms[user][i];
            if (farm.isActive && !farm.isHarvested && block.timestamp >= farm.harvestTime) {
                farmIds[index] = i;
                farms[index] = farm;
                index++;
            }
        }
    }

    // Função de emergência para retirar ETH (sem rewards)
    function emergencyWithdraw(uint256 farmId) external validFarm(msg.sender, farmId) {
        Farm storage farm = userFarms[msg.sender][farmId];
        require(!farm.isHarvested, "TokenFarmManager: Farm already harvested");
        
        uint256 stakedAmount = farm.stakedAmount;
        
        // Marcar como inativa
        farm.isActive = false;
        farm.isHarvested = true;
        
        // Atualizar estatísticas
        totalValueLocked -= stakedAmount;
        
        // Transferir ETH de volta (sem rewards)
        payable(msg.sender).transfer(stakedAmount);
        
        emit EmergencyWithdraw(msg.sender, farmId, stakedAmount);
    }

    // Função para definir o PaymentVault (apenas owner)
    function setPaymentVault(address _paymentVault) external onlyOwner {
        require(_paymentVault != address(0), "TokenFarmManager: Invalid payment vault address");
        paymentVault = _paymentVault;
    }

    // Função para o owner depositar USDC para rewards (agora usa o PaymentVault)
    function depositRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "TokenFarmManager: Amount must be greater than 0");
        require(IERC20(usdcToken).transferFrom(msg.sender, address(this), amount), "TokenFarmManager: transferFrom failed");
    }

    // Função para o owner retirar USDC não utilizados
    function withdrawUnusedRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "TokenFarmManager: Amount must be greater than 0");
        require(IERC20(usdcToken).balanceOf(address(this)) >= amount, "TokenFarmManager: Insufficient balance");
        require(IERC20(usdcToken).transfer(msg.sender, amount), "TokenFarmManager: transfer failed");
    }

    // Função para obter estatísticas globais
    function getGlobalStats() external view returns (
        uint256 _totalValueLocked,
        uint256 _totalRewardsDistributed,
        uint256 _farmCounter,
        uint256 _usdcBalance
    ) {
        return (
            totalValueLocked,
            totalRewardsDistributed,
            farmCounter,
            IERC20(usdcToken).balanceOf(address(this))
        );
    }

    // Função para receber ETH
    receive() external payable {
        // Permite que o contrato receba ETH
    }
}