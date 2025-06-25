'use client';
import React, { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { fetchNftsForOwner } from '@/utils/fetchNfts';

function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A7 7 0 1 0 5 17.5" />
      <path d="M17.5 19H7a4 4 0 1 1 0-8c.2 0 .4 0 .6.03" />
    </svg>
  );
}

const ALCHEMY_BASE_URL =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    ? `https://base-sepolia.g.alchemy.com/nft/v3/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    : '';

export default function NFTAuctionPage() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [auctionName, setAuctionName] = useState('');
  const [description, setDescription] = useState('');
  const [minBid, setMinBid] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [nftError, setNftError] = useState('');
  const [loadingMetadataIdx, setLoadingMetadataIdx] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch NFTs for connected wallet using Alchemy SDK
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!isConnected || !address) return;
      setLoadingNFTs(true);
      setNftError('');
      try {
        const nftsList = await fetchNftsForOwner(address);
        setNfts(nftsList);
      } catch (err) {
        setNftError('Failed to fetch NFTs.');
      } finally {
        setLoadingNFTs(false);
      }
    };
    fetchNFTs();
  }, [isConnected, address]);

  const handleDisconnect = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("W3M_CONNECTED");
        localStorage.removeItem("wagmi.connected");
        localStorage.removeItem("walletconnect");
      }
      await disconnectAsync();
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const handleConnect = () => {
    try {
      open();
    } catch (error) {
      console.error("Connect error:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle auction creation logic
    alert(`Auction Created!\nName: ${auctionName}\nDescription: ${description}\nMin Bid: ${minBid} cUSDC\nNFT: ${selectedNFT?.title?.name || selectedNFT?.metadata?.name || selectedNFT?.tokenId}`);
  };

  // Fetch NFT metadata if missing when selected
  const handleSelectNFT = async (nft: any, idx: number) => {
    // If metadata and image are present, just select
    let img =
      nft.media?.[0]?.gateway ||
      nft.media?.[0]?.raw ||
      nft.metadata?.image ||
      nft.rawMetadata?.image ||
      '';
    let name = nft.title?.name || nft.metadata?.name || nft.rawMetadata?.name || `#${nft.tokenId}`;
    if (img && name) {
      setSelectedNFT(nft);
      return;
    }
    // Otherwise, fetch metadata
    setLoadingMetadataIdx(idx);
    try {
      const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      const url = `https://base-sepolia.g.alchemy.com/nft/v3/${apiKey}/getNFTMetadata?contractAddress=${nft.contract?.address}&tokenId=${nft.tokenId}`;
      const res = await fetch(url);
      const meta = await res.json();
      // Merge fetched metadata into NFT object
      const updatedNFT = { ...nft, ...meta };
      setSelectedNFT(updatedNFT);
    } catch (err) {
      setSelectedNFT(nft); // fallback
    } finally {
      setLoadingMetadataIdx(null);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-inco-navy flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inco-navy text-white flex flex-col items-center px-4">
      {/* Branding and Wallet Row */}
      <div className="w-full flex items-center justify-between pt-6 pb-8 max-w-4xl mx-auto">
        <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue">
          <CloudIcon className="w-6 h-6 text-inco-blue" />
          Incostream
        </span>
        {mounted && (
          isConnected ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-2 bg-red-500/80 text-white border border-red-500/40 shadow hover:bg-red-600/90 transition-colors rounded-full text-sm font-semibold"
              title="Disconnect"
            >
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="px-6 py-2 bg-inco-blue text-white hover:bg-inco-blue/90 transition-colors rounded-full text-sm font-semibold"
            >
              Connect Wallet
            </button>
          )
        )}
      </div>
      {/* Confirm disconnect modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-inco-navy border border-white/10 rounded-2xl p-8 flex flex-col items-center shadow-xl">
            <div className="mb-4 text-lg font-bold text-inco-blue">Disconnect Wallet?</div>
            <div className="mb-6 text-white/70">Are you sure you want to disconnect your wallet?</div>
            <div className="flex gap-4">
              <button
                onClick={async () => { setShowConfirm(false); await handleDisconnect(); }}
                className="px-6 py-2 bg-red-500/80 text-white rounded-full font-semibold hover:bg-red-600/90 transition-colors"
              >
                Disconnect
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-inco-blue drop-shadow">NFT Auction</h1>
        <p className="text-white/70 text-center max-w-xl text-lg mb-8">Create a new NFT auction. Select an NFT from your wallet, set a minimum bid (in cUSDC), and provide auction details.</p>
        <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Auction Name</label>
            <input
              type="text"
              value={auctionName}
              onChange={e => setAuctionName(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-inco-blue/40 rounded-full transition-all text-base font-mono"
              placeholder="e.g. Genesis Drop"
              maxLength={32}
              required
              disabled={!isConnected}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-inco-blue/40 rounded-2xl transition-all text-base font-mono resize-none"
              placeholder="Describe your auction..."
              rows={3}
              maxLength={256}
              required
              disabled={!isConnected}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Minimum Bid (cUSDC)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={minBid}
              onChange={e => setMinBid(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-inco-blue/40 rounded-full transition-all text-base font-mono"
              placeholder="e.g. 10"
              required
              disabled={!isConnected}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Select NFT</label>
            {!isConnected ? (
              <div className="text-white/60 text-sm">Connect your wallet to select an NFT.</div>
            ) : loadingNFTs ? (
              <div className="text-white/60 text-sm">Loading NFTs...</div>
            ) : nftError ? (
              <div className="text-red-400 text-sm">{nftError}</div>
            ) : nfts.length === 0 ? (
              <div className="text-red-400 text-sm">No NFTs found in your wallet or failed to load NFTs. Check the browser console for debug output.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nfts.map((nft, idx) => {
                  console.log('NFT:', nft); // DEBUG: log the full NFT object
                  let img = nft.image?.cachedUrl || '';
                  if (img) {
                    if (img.startsWith('ipfs://')) {
                      img = img.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
                    } else if (!img.startsWith('http')) {
                      img = `https://cloudflare-ipfs.com/ipfs/${img}`;
                    }
                  }
                  const isSelected = selectedNFT?.tokenId === nft.tokenId;
                  return (
                    <div
                      key={`${nft.contract?.address?.toLowerCase()}:${nft.tokenId}:${idx}`}
                      className={`flex flex-col items-center border rounded-xl p-4 bg-white/10 transition-colors shadow-md cursor-pointer ${isSelected ? 'border-inco-blue ring-2 ring-inco-blue' : 'border-white/20 hover:border-inco-blue/60'}`}
                      onClick={() => setSelectedNFT(nft)}
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={nft.name || 'NFT'}
                          className="w-24 h-24 object-cover rounded-lg mb-3 border border-white/10 shadow"
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://placehold.co/96x96?text=No+Img';
                          }}
                        />
                      ) : (
                        <div className="w-24 h-24 flex items-center justify-center bg-white/10 rounded-lg mb-3 text-xs text-white/40 border border-white/10 shadow">
                          No Image
                        </div>
                      )}
                      <div className="font-mono text-sm text-white font-bold mb-1 truncate w-full text-center">{nft.name || '—'}</div>
                      <div className="text-xs text-white/70 text-center line-clamp-2 w-full">{nft.description || '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-inco-blue/90 to-inco-blue rounded-full text-white font-bold text-base shadow-lg hover:from-inco-blue hover:to-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono mt-2"
            disabled={!isConnected || !selectedNFT}
          >
            Create Auction
          </button>
        </form>
      </div>
    </div>
  );
} 