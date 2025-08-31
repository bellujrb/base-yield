// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {TokenFarmManager} from "../src/TokenFarmManager.sol";
import {PaymentVault} from "../src/PaymentVault.sol";
import {USDC} from "../src/USDC.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {        
        // Inicia a transmissão das transações
        vm.startBroadcast();
        
        // 1. Deploy do token USDC (mock)
        USDC usdc = new USDC();
        console.log("USDC deployed at:", address(usdc));
        
        // 2. Deploy do PaymentVault
        PaymentVault paymentVault = new PaymentVault(address(usdc));
        console.log("PaymentVault deployed at:", address(paymentVault));
        
        // 3. Deploy do TokenFarmManager
        TokenFarmManager tokenFarmManager = new TokenFarmManager(address(usdc));
        console.log("TokenFarmManager deployed at:", address(tokenFarmManager));
        
        // 4. Configuração das conexões entre contratos
        
        // Configura o TokenFarmManager no PaymentVault
        paymentVault.setTokenFarmManager(address(tokenFarmManager));
        console.log("PaymentVault configured with TokenFarmManager");
        
        // Configura o PaymentVault no TokenFarmManager
        tokenFarmManager.setPaymentVault(address(paymentVault));
        console.log("TokenFarmManager configured with PaymentVault");
        
        // 5. Mint inicial de USDC para o PaymentVault (para rewards)
        uint256 initialRewards = 1000000 * 10**6; // 1M USDC
        usdc.mint2(address(paymentVault), initialRewards);
        console.log("Minted initial USDC rewards to PaymentVault:", initialRewards);
        
        // 6. Mint USDC para o deployer (para testes)
        uint256 deployerAmount = 100000 * 10**6; // 100K USDC
        usdc.mint2(msg.sender, deployerAmount);
        console.log("Minted USDC to deployer:", deployerAmount);
        
        // Para de transmitir transações
        vm.stopBroadcast();
        
        // Log final com endereços dos contratos
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("USDC Token:", address(usdc));
        console.log("PaymentVault:", address(paymentVault));
        console.log("TokenFarmManager:", address(tokenFarmManager));
        console.log("\n=== FARMING SYSTEM READY ===");
        console.log("Users can now stake ETH and earn USDC rewards!");
        console.log("Growth period: 24 hours");
        console.log("Base yield: 5% + level bonuses");
    }
}