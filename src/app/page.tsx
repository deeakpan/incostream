'use client';

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import EncryptedTokenDashboard from "@/components/encrypted-token-dashboard";
import { ConfirmModal } from "@/components/encrypted-token-dashboard";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState('active');
  const [search, setSearch] = useState('');
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <div className="min-h-screen bg-inco-navy text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-inco-navy flex flex-col items-center py-8 px-4 border-r border-white/10">
        <div className="flex flex-col items-center w-full">
          <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue mb-4">
            <CloudIcon className="w-6 h-6 text-inco-blue" />
            Incostream
          </span>
          <div className="w-full border-b border-white/10 mb-6" />
          <nav className="flex flex-col gap-2 w-full mt-2">
            <SidebarLink label="Mint" href="/mint" />
            <SidebarLink label="Pending" href="#pending" />
            <SidebarLink label="My Bids" href="#my-bids" />
            <button className="mt-4 px-4 py-2 bg-inco-blue text-white font-semibold shadow hover:bg-inco-blue/90 transition-colors text-sm w-full rounded-full">
              Create Auction
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs, Search, and Wallet Button */}
        <div className="w-full max-w-7xl mx-auto flex items-center gap-2 px-6 pt-8 pb-4">
          <div className="flex gap-1">
            {AUCTION_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-1 rounded font-medium text-sm transition-colors ${activeTab === tab.value ? 'bg-inco-blue text-white' : 'text-white/60 hover:bg-white/10'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search auctions..."
            className="ml-4 flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm px-3 py-1"
            style={{ minWidth: 180 }}
          />
          <div className="flex-1" />
          {/* Wallet Connect/Disconnect Button (same as Mint page, but not rounded) */}
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
              className="px-6 py-2 bg-inco-blue text-white hover:bg-inco-blue/90 transition-colors rounded-full text-sm font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Active/Ended Auctions */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-inco-blue">{activeTab === 'active' ? 'Active Auctions' : 'Ended Auctions'}</h3>
            <span className="text-xs text-white/40">{filteredAuctions.length} found</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

