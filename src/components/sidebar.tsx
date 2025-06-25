"use client";
import Link from "next/link";

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

export function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A7 7 0 1 0 5 17.5" />
      <path d="M17.5 19H7a4 4 0 1 1 0-8c.2 0 .4 0 .6.03" />
    </svg>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden sm:flex w-56 min-h-screen bg-inco-navy flex-col items-center py-8 px-4 border-r border-white/10">
      <div className="flex flex-col items-center w-full">
        <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-inco-blue mb-4">
          <CloudIcon className="w-6 h-6 text-inco-blue" />
          Incostream
        </span>
        <div className="w-full border-b border-white/10 mb-6" />
        <nav className="flex flex-col gap-2 w-full mt-2">
          <SidebarLink label="Main Hall" href="/" />
          <SidebarLink label="Mint" href="/mint" />
          <SidebarLink label="Pending" href="#pending" />
          <SidebarLink label="My Bids" href="#my-bids" />
          <Link href="/auction" className="mt-4 px-4 py-2 bg-inco-blue text-white font-semibold shadow hover:bg-inco-blue/90 transition-colors text-sm w-full rounded-full text-center block">
            Create Auction
          </Link>
        </nav>
      </div>
    </aside>
  );
} 