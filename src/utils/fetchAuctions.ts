import { ethers } from "ethers";
import { CONFIDENTIAL_AUCTION_CONTRACT_ADDRESS, CONFIDENTIAL_AUCTION_ABI } from "@/utils/contract";

export interface Auction {
  auctionId: string;
  nftAddress: string;
  tokenId: string;
  endTime: string;
  minBid: string;
  settled: boolean;
  metadataURI: string;
  seller: string;
}

export async function fetchAllAuctions(): Promise<Auction[]> {
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL);
  const contract = new ethers.Contract(CONFIDENTIAL_AUCTION_CONTRACT_ADDRESS, CONFIDENTIAL_AUCTION_ABI, provider);

  const count = await contract.auctionCount();
  const auctions: Auction[] = [];

  for (let i = 0; i < count; i++) {
    const auction = await contract.auctions(i);
    auctions.push({
      auctionId: i.toString(),
      nftAddress: auction.nftAddress,
      tokenId: auction.tokenId.toString(),
      endTime: auction.endTime.toString(),
      minBid: auction.minBid.toString(),
      settled: auction.settled,
      metadataURI: auction.metadataURI,
      seller: auction.seller,
    });
  }
  return auctions;
} 