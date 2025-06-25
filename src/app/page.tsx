'use client';

import { useState, useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import EncryptedTokenDashboard from "@/components/encrypted-token-dashboard";
import { ConfirmModal } from "@/components/encrypted-token-dashboard";
import Link from "next/link";
import Sidebar from "@/components/sidebar";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data for recent auctions
  const recentAuctions = [
    {
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      title: 'Vintage NFT Collectible',
      currentBid: '1.2 ETH',
      timeLeft: '1h 45m',
      status: 'active',
    },
    {
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      title: 'Exclusive Music Track',
      currentBid: '0.8 ETH',
      timeLeft: '2h 10m',
      status: 'ended',
    },
    {
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      title: 'Digital Sculpture',
      currentBid: '3.1 ETH',
      timeLeft: '4h 5m',
      status: 'active',
    },
  ];

  // Filter auctions by tab and search
  const filteredAuctions = recentAuctions.filter(
    (auction) =>
      auction.status === activeTab &&
      auction.title.toLowerCase().includes(search.toLowerCase())
  );

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-inco-navy flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-inco-navy text-white font-sans flex flex-col sm:flex-row">
      <Sidebar />
      {/* Top navbar for mobile */}
      <header className="flex sm:hidden items-center justify-between px-4 py-4 border-b border-white/10 relative">
        {/* Hamburger menu left */}
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors mr-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <HamburgerIcon className="w-7 h-7 text-white" />
        </button>
        {/* Branding next to menu */}
        <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue">
          <CloudIcon className="w-6 h-6 text-inco-blue" />
          Incostream
        </span>
        {/* Search icon center */}
        <div className="flex-1 flex justify-center">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => {
              setShowSearch((v) => !v);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            aria-label="Search"
          >
            <MagnifierIcon className="w-6 h-6 text-white" />
          </button>
        </div>
        {/* Wallet button right */}
          <div className="flex items-center gap-2">
          <button
            onClick={isConnected ? () => setShowConfirm(true) : handleConnect}
            className={`px-4 py-2 ${isConnected ? 'bg-red-500/80 text-white border border-red-500/40 shadow hover:bg-red-600/90' : 'bg-inco-blue text-white hover:bg-inco-blue/90'} transition-colors rounded-full text-xs font-semibold`}
            title={isConnected ? 'Disconnect' : 'Connect'}
          >
            {isConnected ? 'Connected' : 'Connect'}
          </button>
        </div>
        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div className="w-64 bg-inco-navy border-r border-white/10 flex flex-col p-6 shadow-2xl animate-slide-in-left">
              <div className="flex items-center justify-between mb-6">
                <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue">
                  <CloudIcon className="w-6 h-6 text-inco-blue" />
                  Incostream
                </span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close menu">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <nav className="flex flex-col gap-2 w-full mt-2">
                <SidebarLink label="Mint" href="/mint" />
                <SidebarLink label="Pending" href="#pending" />
                <SidebarLink label="My Bids" href="#my-bids" />
                <Link href="/auction" className="mt-4 px-4 py-2 bg-inco-blue text-white font-semibold shadow hover:bg-inco-blue/90 transition-colors text-sm w-full rounded-full text-center block">
                  Create Auction
                </Link>
              </nav>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
          </div>
        )}
      </header>
      {/* Search input below header on mobile */}
      {showSearch && (
        <div className="px-4 py-2 bg-inco-navy border-b border-white/10 flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-inco-navy border border-white/10 text-white rounded-full px-4 py-2 transition-all shadow-lg focus:outline-none"
            style={{ minWidth: 120 }}
            autoFocus
            onBlur={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs, Search, and Wallet Button (responsive) */}
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 px-2 sm:px-6 pt-4 sm:pt-8 pb-2 sm:pb-4">
          <div className="flex gap-1 w-full sm:w-auto">
            {AUCTION_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1 rounded font-medium text-sm transition-colors w-full sm:w-auto ${activeTab === tab.value ? 'bg-inco-blue text-white' : 'text-white/60 hover:bg-white/10'}`}
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
        <section className="max-w-7xl mx-auto px-2 sm:px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-inco-blue">{activeTab === 'active' ? 'Active Auctions' : 'Ended Auctions'}</h3>
            <span className="text-xs text-white/40">{filteredAuctions.length} found</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {filteredAuctions.length === 0 ? (
              <div className="col-span-full text-center text-white/50 py-12">No auctions found.</div>
            ) : (
              filteredAuctions.map((auction, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-md flex flex-col">
                  <img src={auction.image} alt={auction.title} className="w-full h-36 object-cover" />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="text-base font-semibold mb-1">{auction.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-xs text-white/50">Current Bid</span>
                        <div className="text-sm font-medium">{auction.currentBid}</div>
                      </div>
                      <div>
                        <span className="text-xs text-white/50">Time Left</span>
                        <div className="text-xs">{auction.timeLeft}</div>
                  </div>
                  </div>
                    <button className="mt-3 px-3 py-1.5 bg-inco-blue text-white rounded-md font-semibold hover:bg-inco-blue/90 transition-colors text-xs">
                      Place Bid
                  </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
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

