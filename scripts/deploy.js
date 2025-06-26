// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const ConfidentialAuction = await hre.ethers.getContractFactory("ConfidentialAuction");
  
  // cUSDC address on Base Sepolia (you'll need to replace this with the actual address)
  const cUSDC_ADDRESS = "0xA449bc031fA0b815cA14fAFD0c5EdB75ccD9c80f"; // Replace with actual cUSDC address
  
  console.log("Deploying ConfidentialAuction...");
  console.log("cUSDC Address:", cUSDC_ADDRESS);
  
  // Deploy the contract
  const confidentialAuction = await ConfidentialAuction.deploy(cUSDC_ADDRESS);
  
  // Wait for deployment to finish
  await confidentialAuction.deployed();
  
  const address = confidentialAuction.address;
  console.log("ConfidentialAuction deployed to:", address);
  
  // Verify the contract on BaseScan
  console.log("Waiting for block confirmations...");
  await confidentialAuction.deployTransaction.wait(6);
  
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [cUSDC_ADDRESS],
    });
    console.log("Contract verified on BaseScan");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 