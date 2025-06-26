import { ethers } from "ethers";

const CONTRACT_ADDRESS = '0x3FcEda45e08D131238428848b887b4894C05e146';
const CONTRACT_ABI = [
  "function tokenURI(uint256 tokenId) public view returns (string)"
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
  // 1. Get all Transfer events
  const filter = contract.filters.Transfer(null, null);
  const events = await contract.queryFilter(filter, 0, "latest");

  // 2. Reconstruct ownership
  const ownership: Record<string, string> = {};
  for (const event of events) {
    const args = event.args;
    if (!args) continue;
    // ethers v5: args is an array, v6: args is an object
    let to: string | undefined;
    let tokenId: string | number | undefined;
    if (Array.isArray(args)) {
      // ethers v5: [from, to, tokenId]
      to = args[1];
      tokenId = args[2];
    } else {
      // ethers v6: {from, to, tokenId}
      to = args.to;
      tokenId = args.tokenId;
    }
    if (!to || tokenId === undefined) continue;
    ownership[tokenId.toString()] = to.toLowerCase();
  }
  // 3. Get all tokenIds owned by address
  const ownedTokenIds = Object.entries(ownership)
    .filter(([_, owner]) => owner === address.toLowerCase())
    .map(([tokenId]) => tokenId);

  // 4. Fetch tokenURI and metadata for each
  const nfts = await Promise.all(
    ownedTokenIds.map(async (tokenId) => {
      let tokenURI = '';
      let metadata = null;
      try {
        tokenURI = await contract.tokenURI(tokenId);
        metadata = await fetchMetadata(tokenURI);
      } catch (e) {
        // log error, just return what we have
        console.warn(`Failed to fetch metadata for tokenId ${tokenId}:`, e);
      }
      return { tokenId, tokenURI, metadata };
    })
  );
  return nfts;
} 