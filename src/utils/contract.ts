export const ENCRYPTED_ERC20_CONTRACT_ADDRESS =
  "0xA449bc031fA0b815cA14fAFD0c5EdB75ccD9c80f";

export const CONFIDENTIAL_AUCTION_CONTRACT_ADDRESS = "0x5D4A0d5cb78c69b3ec73d17ac54F19172c39cb93";

export const CONFIDENTIAL_AUCTION_ABI = [
  "function createAuction(address nftAddress, uint256 tokenId, uint256 endTime) external returns (uint256)",
  "function bid(uint256 auctionId, bytes encryptedBid) external",
  "function settleAuction(uint256 auctionId) external",
  "function recoverNFT(address nftAddress, uint256 tokenId) external",
  "function nftEscrow(address nftContract, uint256 tokenId) external view returns (address)",
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, address nft, uint256 tokenId, uint256 endTime)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, bytes encryptedBid)",
  "event AuctionSettled(uint256 indexed auctionId, address winner)",
  "event NFTRecovered(address indexed owner, address nftContract, uint256 tokenId)"
];
