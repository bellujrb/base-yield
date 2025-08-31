// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {SafeTransferLib} from "solady/utils/SafeTransferLib.sol";

contract PaymentVault is Ownable {
    using SafeTransferLib for address;
    
    address public immutable usdcToken;
    address public tokenFarmManager;
    
    // Estatísticas do vault
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    
    event RewardsDeposited(address indexed depositor, uint256 amount);
    event RewardsWithdrawn(address indexed owner, uint256 amount);
    event TokenFarmManagerUpdated(address indexed oldManager, address indexed newManager);
    
    modifier onlyTokenFarmManager() {
        require(msg.sender == tokenFarmManager, "PaymentVault: caller is not the token farm manager");
        _;
    }
    
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "PaymentVault: invalid USDC token address");
        usdcToken = _usdcToken;
        _initializeOwner(msg.sender);
    }
    
    // Função para definir o TokenFarmManager autorizado
    function setTokenFarmManager(address _tokenFarmManager) external onlyOwner {
        require(_tokenFarmManager != address(0), "PaymentVault: invalid token farm manager address");
        address oldManager = tokenFarmManager;
        tokenFarmManager = _tokenFarmManager;
        emit TokenFarmManagerUpdated(oldManager, _tokenFarmManager);
    }
    
    // Função para depositar USDC para rewards (apenas owner)
    function depositRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "PaymentVault: amount must be greater than zero");
        
        IERC20(usdcToken).transferFrom(msg.sender, address(this), amount);
        totalDeposited += amount;
        
        emit RewardsDeposited(msg.sender, amount);
    }
    
    // Função para retirar USDC não utilizados (apenas owner)
    function withdrawUnusedRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "PaymentVault: amount must be greater than zero");
        require(IERC20(usdcToken).balanceOf(address(this)) >= amount, "PaymentVault: insufficient balance");
        
        IERC20(usdcToken).transfer(msg.sender, amount);
        totalWithdrawn += amount;
        
        emit RewardsWithdrawn(msg.sender, amount);
    }
    
    // Função para transferir rewards para usuários (apenas TokenFarmManager)
    function transferReward(address to, uint256 amount) external onlyTokenFarmManager {
        require(to != address(0), "PaymentVault: invalid recipient address");
        require(amount > 0, "PaymentVault: amount must be greater than zero");
        require(IERC20(usdcToken).balanceOf(address(this)) >= amount, "PaymentVault: insufficient balance");
        
        require(IERC20(usdcToken).transfer(to, amount), "PaymentVault: transfer failed");
    }
    
    // Função para obter saldo atual de USDC
    function getUsdcBalance() external view returns (uint256) {
        return IERC20(usdcToken).balanceOf(address(this));
    }
    
    // Função para obter estatísticas do vault
    function getVaultStats() external view returns (
        uint256 _totalDeposited,
        uint256 _totalWithdrawn,
        uint256 _currentBalance
    ) {
        return (
            totalDeposited,
            totalWithdrawn,
            IERC20(usdcToken).balanceOf(address(this))
        );
    }
}