import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!, // Your Alchemy API Key
  network: Network.BASE_SEPOLIA,
};

const alchemy = new Alchemy(settings);

export async function fetchNftsForOwner(address: string) {
  const nfts = await alchemy.nft.getNftsForOwner(address);
  return nfts.ownedNfts;
} 