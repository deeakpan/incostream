"use client";

import React from "react";
import Sidebar from "@/components/sidebar";

function CloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9c-.2 0-.4 0-.6.03A7 7 0 1 0 5 17.5" />
      <path d="M17.5 19H7a4 4 0 1 1 0-8c.2 0 .4 0 .6.03" />
    </svg>
  );
}

export default function CreateAuctionPage() {
  return (
    <div className="min-h-screen bg-inco-navy text-white font-sans flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto flex flex-col gap-8 items-center py-24">
          <h1 className="text-2xl font-bold mb-4 text-center">Create Auction</h1>
          <p className="text-white/70 text-center mb-8">Auction creation form will go here.</p>
        </div>
        <div className="w-full flex justify-center mt-6">
          <span className="text-xs text-white/40 tracking-wide">Powered by <span className="text-inco-blue font-bold">IncoNetwork</span></span>
        </div>
      </div>
    </div>
  );
} 