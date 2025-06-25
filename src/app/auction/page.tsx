"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A7 7 0 1 0 5 17.5" />
      <path d="M17.5 19H7a4 4 0 1 1 0-8c.2 0 .4 0 .6.03" />
    </svg>
  );
}

export default function CreateAuctionPage() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="min-h-screen bg-inco-navy text-white font-sans flex flex-col sm:flex-row">
      <Sidebar hideMobileSearchIcon />
      {mounted && (
        <div className="hidden sm:flex w-full justify-end px-8 pt-8 fixed top-0 right-0 z-30">
          <button
            onClick={isConnected ? () => setShowConfirm(true) : handleConnect}
            className={`px-6 py-2 ${isConnected ? 'bg-red-500/80 text-white border border-red-500/40 shadow hover:bg-red-600/90' : 'bg-inco-blue text-white hover:bg-inco-blue/90'} transition-colors rounded-full text-sm font-semibold`}
            title={isConnected ? 'Disconnect' : 'Connect'}
          >
            {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      )}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-8 items-center py-24">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-center text-inco-blue drop-shadow">Auction Types on Incostream</h1>
          <p className="text-white/70 text-center mb-8 text-lg max-w-xl">Incostream supports a variety of auction formats to empower creators, communities, and innovators. Explore the types below to see what you can launch or participate in!</p>
          <div className="w-full flex flex-col gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg transition-colors hover:border-inco-blue">
              <div className="text-xl font-bold text-inco-blue mb-1 font-sans">NFT Auctions (Classic Bids)</div>
              <div className="text-white/80 text-base font-sans font-medium">Bid on unique NFTs. The highest bidder at the end wins and receives the NFT. Perfect for digital art, collectibles, and more.</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg transition-colors hover:border-inco-blue">
              <div className="text-xl font-bold text-inco-blue mb-1 font-sans">Domain Auctions</div>
              <div className="text-white/80 text-base font-sans font-medium">Bid for ownership of web3 domain names (like .eth or .xyz). The highest bid wins the domain—ideal for branding and digital identity.</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg transition-colors hover:border-inco-blue">
              <div className="text-xl font-bold text-inco-blue mb-1 font-sans">Text/Content Auctions</div>
              <div className="text-white/80 text-base font-sans font-medium">Bid to have your message, proposal, or content featured—on-chain, on a website, or as a shoutout. Great for advertising, memes, or proposals.</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg transition-colors hover:border-inco-blue">
              <div className="text-xl font-bold text-inco-blue mb-1 font-sans">Poll Auctions</div>
              <div className="text-white/80 text-base font-sans font-medium">Participants vote on different options (NFTs, links, or proposals). The option with the most votes is selected for a special purpose, such as being featured or used in a project.</div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center mt-6">
          <span className="text-xs text-white/40 tracking-wide">Powered by <span className="text-inco-blue font-bold">IncoNetwork</span></span>
        </div>
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
      </div>
    </div>
  );
} 