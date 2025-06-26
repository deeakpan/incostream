"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import EncryptedTokenDashboard from "@/components/encrypted-token-dashboard";
import Image from "next/image";
import { ConfirmModal } from "@/components/encrypted-token-dashboard";
import Link from "next/link";

export default function MintPage() {
  return (
    <div className="min-h-screen bg-inco-navy text-white flex flex-col px-4">
      <div className="w-full flex items-center justify-start pt-8 pl-8">
        <span className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-inco-blue">
          <CloudIcon className="w-7 h-7 text-inco-blue" />
          Incostream
        </span>
      </div>
      <div className="w-full flex justify-center mb-2">
        <span className="text-xs text-yellow-400 bg-yellow-900/40 px-3 py-1 rounded-full font-semibold">NOTE: only available on Base Sepolia (Testnet environment)</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full mx-auto flex flex-col gap-8 items-center py-24">
          <p className="mb-4 text-base max-w-sm w-full text-center font-medium">
            Mint an NFT to launch your auction, or get cUSDC for private bidding on Incostream.
          </p>
          <div className="flex flex-col gap-6 w-full bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 text-left">
            <Link href="/mint/nft" className="block w-full">
              <div className="w-full hover:bg-inco-navy/60 rounded-xl transition-colors p-6 text-left text-lg font-semibold cursor-pointer border border-transparent hover:border-inco-blue">
                NFT (ERC-721)
                <div className="text-white/50 text-sm font-normal mt-2">Mint an NFT to create a new auction on the platform.</div>
              </div>
            </Link>
            <Link href="/mint/cusdc" className="block w-full">
              <div className="w-full hover:bg-inco-navy/60 rounded-xl transition-colors p-6 text-left text-lg font-semibold cursor-pointer border border-transparent hover:border-inco-blue">
                cUSDC
                <div className="text-white/60 text-sm font-normal mt-2">Get cUSDC to access confidential, private bidding on Incostream auctions—your gateway to secure, exclusive deals.</div>
              </div>
            </Link>
          </div>
        </div>
        <div className="w-full flex justify-center mt-6">
          <span className="text-xs text-white/40 tracking-wide">Powered by <span className="text-inco-blue font-bold">IncoNetwork</span></span>
        </div>
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