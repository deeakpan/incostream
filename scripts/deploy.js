// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const IncostreamNFT = await hre.ethers.getContractFactory("IncostreamNFT");
  const nft = await IncostreamNFT.deploy();
  await nft.deployed();
  console.log("IncostreamNFT deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 