const hre = require("hardhat");

async function main() {
  // Old contract address where your NFT is stuck
  const OLD_AUCTION_CONTRACT_ADDRESS = "0x337Ec3Dc8c160f0290FCbDdB018e613ADb89eAe6";
  const NFT_CONTRACT_ADDRESS = "0x2A016444A73bDb31b1fC66EC2D5e47030A0E4701";
  const TOKEN_ID = 1; // Replace with your actual token ID
  const USER_ADDRESS = "0x7e217fa1Ce282653115bA04686aE73dd689Ee588";

  console.log("Attempting to recover NFT from old contract...");
  console.log("Old Auction Contract:", OLD_AUCTION_CONTRACT_ADDRESS);
  console.log("NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("Token ID:", TOKEN_ID);
  console.log("User Address:", USER_ADDRESS);

  // Get the signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Using signer:", signer.address);

  try {
    // Create a minimal contract interface for the old contract
    const oldContract = new hre.ethers.Contract(
      OLD_AUCTION_CONTRACT_ADDRESS,
      [
        "function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4)"
      ],
      signer
    );

    // Try to call onERC721Received to trigger a transfer back
    // This is a workaround since the old contract doesn't have a recovery function
    console.log("Attempting recovery through onERC721Received...");
    
    // Create a dummy call to try to recover the NFT
    const dummyData = hre.ethers.utils.toUtf8Bytes("recovery");
    const tx = await oldContract.onERC721Received(
      signer.address,
      signer.address,
      TOKEN_ID,
      dummyData
    );
    
    console.log("Recovery transaction sent:", tx.hash);
    await tx.wait();
    console.log("Recovery transaction confirmed");
    
  } catch (error) {
    console.error("Error in recovery attempt:", error.message);
    
    // Alternative approach: Try to create a fake auction to recover the NFT
    console.log("Trying alternative recovery method...");
    
    try {
      const newContract = new hre.ethers.Contract(
        OLD_AUCTION_CONTRACT_ADDRESS,
        [
          "function createAuction(address nftAddress, uint256 tokenId, uint256 endTime) external returns (uint256)"
        ],
        signer
      );
      
      // Try to create an auction with a far future end time, then immediately settle it
      const farFutureTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const tx = await newContract.createAuction(NFT_CONTRACT_ADDRESS, TOKEN_ID, farFutureTime);
      console.log("Created recovery auction:", tx.hash);
      await tx.wait();
      console.log("Recovery auction created successfully");
      
    } catch (error2) {
      console.error("Alternative recovery also failed:", error2.message);
      console.log("Your NFT may need manual intervention to recover.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 