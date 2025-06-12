// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EncryptedMessage.sol";

contract DeployEncryptedMessage is Script {
    function run() public returns (EncryptedMessage) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_BASE_SEPOLIA");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        EncryptedMessage encryptedMessage = new EncryptedMessage();
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log the deployed address
        console2.log("EncryptedMessage deployed to:", address(encryptedMessage));
        
        return encryptedMessage;
    }
} 