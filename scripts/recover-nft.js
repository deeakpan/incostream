const hre = require("hardhat");

async function main() {
  // Contract addresses
  const AUCTION_CONTRACT_ADDRESS = "0x337Ec3Dc8c160f0290FCbDdB018e613ADb89eAe6";
  const NFT_CONTRACT_ADDRESS = "0x2A016444A73bDb31b1fC66EC2D5e47030A0E4701";
  const TOKEN_ID = 1; // Replace with your actual token ID
  const USER_ADDRESS = "0x7e217fa1Ce282653115bA04686aE73dd689Ee588"; // Replace with your address

  console.log("Recovering NFT...");
  console.log("Auction Contract:", AUCTION_CONTRACT_ADDRESS);
  console.log("NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("Token ID:", TOKEN_ID);
  console.log("User Address:", USER_ADDRESS);

  // Get the contract
  const ConfidentialAuction = await hre.ethers.getContractFactory("ConfidentialAuction");
  const auctionContract = ConfidentialAuction.attach(AUCTION_CONTRACT_ADDRESS);

  try {
    // Check if NFT is in escrow
    const escrowOwner = await auctionContract.nftEscrow(NFT_CONTRACT_ADDRESS, TOKEN_ID);
    console.log("NFT in escrow for:", escrowOwner);

    if (escrowOwner === USER_ADDRESS) {
      console.log("Recovering NFT...");
      const tx = await auctionContract.recoverNFT(NFT_CONTRACT_ADDRESS, TOKEN_ID);
      await tx.wait();
      console.log("NFT recovered successfully! Transaction hash:", tx.hash);
    } else {
      console.log("NFT not found in escrow for this user");
    }
  } catch (error) {
    console.error("Error recovering NFT:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 