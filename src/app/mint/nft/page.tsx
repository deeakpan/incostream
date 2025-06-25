"use client";

import React, { useEffect, useState } from "react";
import { useAccount, useDisconnect, useWriteContract } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import Image from "next/image";
import ReactDOM from "react-dom";
// @ts-ignore
import lighthouse from '@lighthouse-web3/sdk';
import { parseAbi } from 'viem';

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
const CONTRACT_ADDRESS = '0x3FcEda45e08D131238428848b887b4894C05e146';
const CONTRACT_ABI = parseAbi([
  'function mint(string tokenURI) public returns (uint256)'
]);

// CloudIcon copied for branding consistency
function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A7 7 0 1 0 5 17.5" />
      <path d="M17.5 19H7a4 4 0 1 1 0-8c.2 0 .4 0 .6.03" />
    </svg>
  );
}

// Simple confirmation modal (copied from cUSDC)
function ConfirmModal({ open, onConfirm, onCancel, address }: { open: boolean; onConfirm: () => void; onCancel: () => void; address: string }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-xl shadow-lg p-6 min-w-[300px] flex flex-col items-center">
        <div className="text-white text-sm mb-4">Disconnect wallet <span className="font-mono font-bold">{address?.slice(0, 6)}...{address?.slice(-4)}</span>?</div>
        <div className="flex gap-3 mt-2">
          <button onClick={onCancel} className="px-4 py-1.5 rounded bg-white/10 text-white hover:bg-white/20 transition-colors text-xs">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-1.5 rounded bg-red-500 text-white hover:bg-red-600 transition-colors text-xs font-semibold">Disconnect</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// MintOnChainButton component
function MintOnChainButton({ tokenURI }: { tokenURI: string }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    setError(null);
    setTxHash(null);
    try {
      const tx = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mint',
        args: [tokenURI],
      });
      setTxHash(tx);
    } catch (err: any) {
      setError(err.message || 'Mint failed');
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleMint}
        disabled={isPending}
        className="w-full py-3 bg-gradient-to-r from-inco-blue/90 to-inco-blue rounded-full text-white font-bold text-base shadow-lg hover:from-inco-blue hover:to-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono"
      >
        {isPending ? 'Minting On-Chain...' : 'Mint On-Chain'}
      </button>
      {txHash && (
        <div className="mt-2 text-xs break-all">Tx: <a href={`https://sepolia.basescan.org/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline text-inco-blue">{txHash}</a></div>
      )}
      {error && (
        <div className="mt-2 text-xs text-red-400">{error}</div>
      )}
    </div>
  );
}

export default function MintNFTPage() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [metaData, setMetaData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMetaData(null);
    if (!name || !description || !image) {
      setError("Please fill in all fields and select an image.");
      return;
    }
    if (!LIGHTHOUSE_API_KEY) {
      setError("Lighthouse API key is not set in environment variables.");
      return;
    }
    setIsMinting(true);
    try {
      // 1. Upload image to Lighthouse
      const imageUpload = await lighthouse.upload([image], LIGHTHOUSE_API_KEY);
      const imageCID = imageUpload?.data?.Hash;
      if (!imageCID) throw new Error("Image upload failed");
      // 2. Create metadata JSON
      const metadataObj = {
        name,
        description,
        minter: address,
        image: `https://gateway.lighthouse.storage/ipfs/${imageCID}`
      };
      const metadataStr = JSON.stringify(metadataObj, null, 2);
      // 3. Upload metadata JSON to Lighthouse
      const metaUpload = await lighthouse.uploadText(metadataStr, LIGHTHOUSE_API_KEY, name + "-metadata.json");
      const metaCID = metaUpload?.data?.Hash;
      if (!metaCID) throw new Error("Metadata upload failed");
      setMetaData({ ...metadataObj, imageCID, metaCID });
    } catch (err: any) {
      setError(err.message || "Minting failed");
    } finally {
      setIsMinting(false);
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
    <div className="min-h-screen bg-inco-navy text-white">
      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* Desktop Header */}
        <header className="hidden sm:flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue">
              <CloudIcon className="w-6 h-6 text-inco-blue" />
              Incostream
            </span>
          </div>
          {isConnected ? (
            <>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center justify-center h-9 px-3 bg-red-500/80 text-white border border-red-500/40 rounded-full shadow hover:bg-red-600/90 transition-colors text-xs font-mono"
                title="Disconnect"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
              <ConfirmModal
                open={showConfirm}
                onConfirm={async () => { setShowConfirm(false); await handleDisconnect(); }}
                onCancel={() => setShowConfirm(false)}
                address={address ?? ""}
              />
            </>
          ) : (
            <button
              onClick={handleConnect}
              className="px-6 py-2.5 bg-inco-blue text-white hover:bg-inco-blue/90 transition-colors rounded-full text-sm font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </header>
        {/* Mobile Header */}
        <header className="sm:hidden mb-16">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue">
              <CloudIcon className="w-6 h-6 text-inco-blue" />
              Incostream
            </span>
            <button
              onClick={isConnected ? () => setShowConfirm(true) : handleConnect}
              className={`px-4 py-2 ${isConnected ? 'bg-red-500/80 text-white border border-red-500/40 shadow hover:bg-red-600/90' : 'bg-inco-blue text-white hover:bg-inco-blue/90'} transition-colors rounded-full text-xs font-semibold`}
              title={isConnected ? 'Disconnect' : 'Connect'}
            >
              {isConnected ? 'Connected' : 'Connect'}
            </button>
          </div>
          <ConfirmModal
            open={showConfirm}
            onConfirm={async () => { setShowConfirm(false); await handleDisconnect(); }}
            onCancel={() => setShowConfirm(false)}
            address={address ?? ""}
          />
        </header>
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-md w-full mx-auto flex flex-col gap-8 items-center py-16">
            <h1 className="text-2xl font-bold text-center mb-2">Mint Your NFT (ERC-721)</h1>
            <p className="text-white/70 text-center mb-4">
              Create a unique NFT to launch your own auction on Incostream. Enter a name, description, and upload an image. Your NFT will be minted to your connected wallet on Base Sepolia.
            </p>
            {!isConnected ? (
              <div className="w-full flex flex-col items-center gap-4 bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8">
                <div className="text-white/70 text-center mb-2">Connect your wallet to mint an NFT and start your auction journey.</div>
                <button
                  onClick={handleConnect}
                  className="px-6 py-2.5 bg-inco-blue text-white hover:bg-inco-blue/90 transition-colors rounded-full text-sm font-semibold"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                <form onSubmit={handleMint} className="w-full flex flex-col gap-6 bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8">
                  <div>
                    <label className="block text-sm font-semibold mb-2">NFT Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-inco-blue/40 rounded-full transition-all text-base font-mono"
                      placeholder="e.g. Inco Genesis"
                      disabled={isMinting}
                      maxLength={32}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-inco-blue/40 rounded-2xl transition-all text-base font-mono resize-none"
                      placeholder="Describe your NFT and its purpose..."
                      rows={3}
                      disabled={isMinting}
                      maxLength={256}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-inco-blue/80 file:text-white hover:file:bg-inco-blue"
                      disabled={isMinting}
                      required
                    />
                    {imagePreview && (
                      <div className="mt-4 flex justify-center">
                        <Image src={imagePreview} alt="NFT Preview" width={120} height={120} className="rounded-xl border border-white/10 shadow-lg object-cover" />
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-full text-sm mb-2 text-center">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-inco-blue/90 to-inco-blue rounded-full text-white font-bold text-base shadow-lg hover:from-inco-blue hover:to-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono mt-2"
                    disabled={isMinting}
                  >
                    {isMinting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      "Mint NFT"
                    )}
                  </button>
                </form>
                {metaData && (
                  <div className="w-full mt-8 bg-white/10 border border-white/20 rounded-xl p-4 text-white">
                    <div className="mb-2 font-bold text-inco-blue">NFT Metadata Uploaded!</div>
                    <div className="text-xs break-all mb-2">Metadata CID: <span className="font-mono">{metaData.metaCID}</span></div>
                    <div className="text-xs break-all mb-2">Image CID: <span className="font-mono">{metaData.imageCID}</span></div>
                    <div className="mb-2">Minter: <span className="font-mono">{metaData.minter}</span></div>
                    <div className="mb-2">Name: {metaData.name}</div>
                    <div className="mb-2">Description: {metaData.description}</div>
                    <div className="mb-2">Image: <a href={`https://gateway.lighthouse.storage/ipfs/${metaData.imageCID}`} target="_blank" rel="noopener noreferrer" className="underline text-inco-blue">View Image</a></div>
                    <div className="mb-2">Metadata: <a href={`https://gateway.lighthouse.storage/ipfs/${metaData.metaCID}`} target="_blank" rel="noopener noreferrer" className="underline text-inco-blue">View Metadata JSON</a></div>
                    <MintOnChainButton tokenURI={`https://gateway.lighthouse.storage/ipfs/${metaData.metaCID}`} />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="w-full flex justify-center mt-6">
            <span className="text-xs text-white/40 tracking-wide">Powered by <span className="text-inco-blue font-bold">IncoNetwork</span></span>
          </div>
        </div>
      </div>
    </div>
  );
} 