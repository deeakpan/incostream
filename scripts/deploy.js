const hre = require("hardhat");

async function main() {
  console.log("Deploying EncryptedMessage contract...");

  const EncryptedMessage = await hre.ethers.getContractFactory("EncryptedMessage");
  const encryptedMessage = await EncryptedMessage.deploy();

  await encryptedMessage.waitForDeployment();

  const address = await encryptedMessage.getAddress();
  console.log(`EncryptedMessage deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 