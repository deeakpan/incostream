'use client';

import { useState, useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import EncryptedTokenDashboard from "@/components/encrypted-token-dashboard";
import { ConfirmModal } from "@/components/encrypted-token-dashboard";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { fetchAllAuctions, Auction } from "@/utils/fetchAuctions";

const AUCTION_TABS = [
  { label: 'Active', value: 'active' },
  { label: 'Ended', value: 'ended' },
];

function SidebarLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="px-3 py-2 rounded text-base font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full block text-left"
    >
      {label}
    </a>
  );
}

function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A7 7 0 1 0 5 17.5" />
      <path d="M17.5 19H7a4 4 0 1 1 0-8c.2 0 .4 0 .6.03" />
    </svg>
  );
}

function MagnifierIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
  );
}

function HamburgerIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('active');
  const [search, setSearch] = useState('');
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Fetch all auctions from blockchain
    fetchAllAuctions().then((data) => {
      setAuctions(data);
      setLoadingAuctions(false);
    });
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

  const now = Math.floor(Date.now() / 1000);
  const filteredAuctions = auctions.filter(a =>
    activeTab === 'active'
      ? !a.settled && Number(a.endTime) > now
      : a.settled || Number(a.endTime) <= now
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-inco-navy flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inco-navy text-white font-sans flex flex-col sm:flex-row">
      <Sidebar onMobileSearchClick={() => setShowSearch((v) => !v)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile search bar, toggled by icon in header */}
        {showSearch && (
          <div className="sm:hidden px-4 pb-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search auctions..."
              className="w-full bg-transparent border border-white/10 rounded px-3 py-2 text-white placeholder-white/40 text-sm outline-none"
              ref={searchInputRef}
              autoFocus
            />
          </div>
        )}
        {/* Tabs, Search, and Wallet Button (responsive) */}
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 px-2 sm:px-6 pt-4 sm:pt-8 pb-2 sm:pb-4">
          <div className="flex gap-1 w-full sm:w-auto">
            {AUCTION_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1 rounded-none font-medium text-sm transition-colors w-full sm:w-auto
                  ${activeTab === tab.value
                    ? 'border-b-2 border-inco-blue text-inco-blue bg-transparent'
                    : 'text-white/60 hover:bg-white/10 border-b-2 border-transparent'}
                `}
                style={{ background: 'none' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Search bar only on desktop */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search auctions..."
            className="hidden sm:block w-full sm:ml-4 sm:w-auto bg-transparent border-none outline-none text-white placeholder-white/40 text-sm px-3 py-1"
            style={{ minWidth: 120 }}
          />
          <div className="flex-1 hidden sm:block" />
          {/* Wallet Connect/Disconnect Button only on desktop */}
          {isConnected ? (
            <>
              <button
                onClick={() => setShowConfirm(true)}
                className="hidden sm:flex items-center justify-center h-9 px-3 bg-red-500/80 text-white border border-red-500/40 rounded-full shadow hover:bg-red-600/90 transition-colors text-xs font-mono w-full sm:w-auto"
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
              className="hidden sm:flex px-6 py-2 bg-inco-blue text-white hover:bg-inco-blue/90 transition-colors rounded-full text-sm font-semibold w-full sm:w-auto"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Active/Ended Auctions */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 pb-8">
          {loadingAuctions ? (
            <div className="text-white/60 py-8">Loading auctions...</div>
          ) : filteredAuctions.length === 0 ? (
            <div className="text-white/60 py-8">No auctions found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAuctions.map((auction) => (
                <div key={auction.auctionId} className="bg-white/5 rounded-lg p-4 flex flex-col gap-2">
                  <div className="text-xs text-white/40">Auction #{auction.auctionId}</div>
                  <div className="font-bold text-lg">NFT: {auction.nftAddress} #{auction.tokenId}</div>
                  <div>Min Bid: <span className="font-mono">{auction.minBid}</span> cUSDC</div>
                  <div>Ends: {new Date(Number(auction.endTime) * 1000).toLocaleString()}</div>
                  <div className="text-xs text-white/40">Seller: {auction.seller}</div>
                  {/* Optionally, show image if you fetch it from metadataURI */}
                  <button className="mt-2 px-4 py-2 bg-inco-blue rounded text-white font-semibold hover:bg-inco-blue/90 transition-colors">Bid</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WalletIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2.5" y="5" width="15" height="10" rx="3" fill="currentColor" className="text-inco-blue/30" />
      <rect x="2.5" y="5" width="15" height="10" rx="3" stroke="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

