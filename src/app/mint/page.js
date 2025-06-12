"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import EncryptedTokenInterface from "@/components/encrypted-token-ineterface";
import EncryptedSend from "@/components/encrypted-send";
import { Wallet } from "lucide-react";

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Mint Encrypted cUSDC</h1>
      <div className="mb-8">
        {!isConnected ? (
          <button
            onClick={open}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white truncate max-w-[150px]">
                {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <>
          <div className="w-full max-w-xl mb-8">
            <EncryptedTokenInterface />
          </div>
          <div className="w-full max-w-xl">
            <EncryptedSend />
          </div>
        </>
      )}
    </div>
  );
} 