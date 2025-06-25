"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";

function SidebarLink({ label, href, active }: { label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded text-base font-medium w-full block text-left transition-colors ${
        active
          ? "bg-inco-blue/20 text-inco-blue font-bold"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A7 7 0 1 0 5 17.5" />
      <path d="M17.5 19H7a4 4 0 1 1 0-8c.2 0 .4 0 .6.03" />
    </svg>
  );
}

export default function Sidebar({ onMobileSearchClick, hideMobileSearchIcon }: { onMobileSearchClick?: () => void; hideMobileSearchIcon?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const { open: openModal } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();
  const [showConfirm, setShowConfirm] = useState(false);

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
      openModal();
    } catch (error) {
      console.error("Connect error:", error);
    }
  };

  return (
    <>
      {/* Mobile collapse/expand button, branding, and wallet button in header */}
      <div className="sm:hidden flex items-center justify-between px-4 py-4 bg-inco-navy border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            )}
          </button>
          <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue">
            <CloudIcon className="w-6 h-6 text-inco-blue" />
            Incostream
          </span>
          {/* Mobile search icon */}
          {!hideMobileSearchIcon && (
            <button
              className="ml-2 p-2 rounded-full hover:bg-white/10 transition-colors"
              onClick={onMobileSearchClick}
              aria-label="Show search"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-inco-blue"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </button>
          )}
        </div>
        <button
          onClick={isConnected ? () => setShowConfirm(true) : handleConnect}
          className={`px-4 py-2 ${isConnected ? 'bg-red-500/80 text-white border border-red-500/40 shadow hover:bg-red-600/90' : 'bg-inco-blue text-white hover:bg-inco-blue/90'} transition-colors rounded-full text-xs font-semibold`}
          title={isConnected ? 'Disconnect' : 'Connect'}
        >
          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect'}
        </button>
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
      </div>
      {/* Mobile sidebar drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-40 flex sm:hidden">
          <div className="w-64 bg-inco-navy border-r border-white/10 flex flex-col p-6 shadow-2xl animate-slide-in-left min-h-screen">
            <div className="flex flex-col items-center w-full">
              <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue mb-4">
                <CloudIcon className="w-6 h-6 text-inco-blue" />
                Incostream
              </span>
              <div className="w-full border-b border-white/10 mb-6" />
              <nav className="flex flex-col gap-2 w-full mt-2">
                <SidebarLink label="Main Hall" href="/" active={pathname === "/"} />
                <SidebarLink label="Mint" href="/mint" active={pathname.startsWith("/mint")} />
                <SidebarLink label="Pending" href="#pending" active={pathname === "#pending"} />
                <SidebarLink label="My Bids" href="#my-bids" active={pathname === "#my-bids"} />
                <Link href="/auction" className={`mt-4 px-4 py-2 bg-inco-blue text-white font-semibold shadow hover:bg-inco-blue/90 transition-colors text-sm w-full rounded-full text-center block${pathname.startsWith("/auction") ? " ring-2 ring-inco-blue/60" : ""}`}>
                  Create Auction
                </Link>
              </nav>
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}
      {/* Sidebar for desktop */}
      <aside className="hidden sm:flex w-56 min-h-screen bg-inco-navy flex-col items-center py-8 px-4 border-r border-white/10">
        <div className="flex flex-col items-center w-full">
          <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue mb-4">
            <CloudIcon className="w-6 h-6 text-inco-blue" />
            Incostream
          </span>
          <div className="w-full border-b border-white/10 mb-6" />
          <nav className="flex flex-col gap-2 w-full mt-2">
            <SidebarLink label="Main Hall" href="/" active={pathname === "/"} />
            <SidebarLink label="Mint" href="/mint" active={pathname.startsWith("/mint")} />
            <SidebarLink label="Pending" href="#pending" active={pathname === "#pending"} />
            <SidebarLink label="My Bids" href="#my-bids" active={pathname === "#my-bids"} />
            <Link href="/auction" className={`mt-4 px-4 py-2 bg-inco-blue text-white font-semibold shadow hover:bg-inco-blue/90 transition-colors text-sm w-full rounded-full text-center block${pathname.startsWith("/auction") ? " ring-2 ring-inco-blue/60" : ""}`}>
              Create Auction
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
} 