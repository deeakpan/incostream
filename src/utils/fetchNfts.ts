import { ethers } from "ethers";

const CONTRACT_ADDRESS = '0x2A016444A73bDb31b1fC66EC2D5e47030A0E4701';
const CONTRACT_ABI = [
  "function mint(string tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)"
];

const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

async function fetchMetadata(tokenURI: string) {
  let url = tokenURI;
  if (url.startsWith('ipfs://')) {
    url = url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
  }
  console.log('Trying main URL:', url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (e) {
    console.warn('Main fetch failed:', url, e);
    if (tokenURI.startsWith('ipfs://')) {
      const cid = tokenURI.replace('ipfs://', '');
      for (const gw of [
        `https://ipfs.io/ipfs/${cid}`,
        `https://gateway.lighthouse.storage/ipfs/${cid}`
      ]) {
        try {
          console.log('Trying fallback URL:', gw);
          const res = await fetch(gw);
          if (!res.ok) throw new Error(res.statusText);
          return await res.json();
        } catch (err) {
          console.warn('Fallback fetch failed:', gw, err);
        }
      }
    }
    throw e;
  }
}

export async function fetchNftsForOwner(address: string) {
  const balance = await contract.balanceOf(address);
  const nfts = [];
  for (let i = 0; i < balance; i++) {
    let tokenId, tokenURI, metadata;
    try {
      tokenId = await contract.tokenOfOwnerByIndex(address, i);
      tokenURI = await contract.tokenURI(tokenId);
      metadata = await fetchMetadata(tokenURI);
    } catch (e) {
      // log error, just return what we have
      console.warn(`Failed to fetch NFT at index ${i}:`, e);
    }
    nfts.push({ 
      tokenId, 
      tokenURI, 
      metadata,
      contractAddress: CONTRACT_ADDRESS,
      contract: { address: CONTRACT_ADDRESS }
    });
  }
  return nfts;
} 