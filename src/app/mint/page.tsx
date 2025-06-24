"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import EncryptedTokenDashboard from "@/components/encrypted-token-dashboard";
import Image from "next/image";
import { ConfirmModal } from "@/components/encrypted-token-dashboard";

export default function MintPage() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnectAsync();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const handleConnect = () => {
    try {
      open();
      setMobileMenuOpen(false);
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
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue">
                <CloudIcon className="w-6 h-6 text-inco-blue" />
                Incostream
              </span>
            </div>

            <button
              disabled
              className="p-2 bg-gray-700 text-white/40 rounded cursor-not-allowed opacity-60"
              aria-label="Toggle menu"
            >
              <HamburgerIcon isOpen={mobileMenuOpen} />
            </button>
          </div>
        </header>

        {/* Only show dashboard, always, but pass isConnected */}
        <EncryptedTokenDashboard isConnected={isConnected} />
      </div>
    </div>
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

const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform duration-200"
  >
    <path
      d={isOpen ? "M18 6L6 18" : "M3 12h18"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-200"
    />
    {!isOpen && (
      <>
        <path
          d="M3 6h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {isOpen && (
      <path
        d="M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
); 