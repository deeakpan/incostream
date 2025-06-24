import React, { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { ENCRYPTED_ERC20_CONTRACT_ADDRESS } from "@/utils/contract";

interface EncryptedTokenInterfaceProps {
  encryptedBalance: number;
  isEncryptedLoading: boolean;
  error: string;
  refreshBalance: () => Promise<void>;
  isConnected: boolean;
}

const EncryptedTokenInterface = ({
  encryptedBalance,
  isEncryptedLoading,
  error,
  refreshBalance,
  isConnected,
}: EncryptedTokenInterfaceProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const mintcUSDC = async () => {
    try {
      const cUSDCMintTxHash = await writeContractAsync({
        address: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "mintedAmount",
                type: "uint256",
              },
            ],
            name: "mint",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "mint",
        args: [address as `0x${string}`, parseEther(amount.toString())],
      });

      const tx = await publicClient?.waitForTransactionReceipt({
        hash: cUSDCMintTxHash,
      });

      if (tx?.status !== "success") {
        throw new Error("Transaction failed");
      }
    } catch (err) {
      console.error("Error minting cUSDC:", err);
      throw new Error("Failed to mint cUSDC");
    }
  };

  const handleMint = async () => {
    if (!amount || Number(amount) <= 0) {
      return;
    }

    try {
      setIsLoading(true);
      await mintcUSDC();
      setAmount("");
      await refreshBalance();
    } catch (err) {
      console.error("Error minting cUSDC:", err);
      throw new Error("Failed to mint cUSDC");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-inco-navy/90 border border-white/10 p-8 h-full flex flex-col rounded-3xl shadow-2xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Encrypted Tokens</h2>
        <button
          onClick={refreshBalance}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-40"
          disabled={isEncryptedLoading || !isConnected}
          title="Refresh"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white ${isEncryptedLoading ? "animate-spin" : ""}`}
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>

      {/* Balance Section */}
      <div className="flex items-center justify-between mb-8">
        <span className="text-white/60">Encrypted Balance</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 shadow-inner backdrop-blur-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-2">
              <circle cx="12" cy="12" r="10" stroke="#3673F5" strokeWidth="2" fill="#3673F5" />
              <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontFamily="monospace">c$</text>
            </svg>
            <span className="font-bold font-mono text-lg">
              {isEncryptedLoading ? <span className="text-white/40">Loading...</span> : (encryptedBalance || "0.00")}
            </span>
            <span className="ml-1 text-xs text-white/60">cUSDC</span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <input
          type="number"
          placeholder="Enter Amount to Mint"
          value={amount}
          min={0}
          max={10000}
          onChange={(e) => {
            let val = e.target.value;
            // Remove negative sign and clamp to max 10000
            if (val === "") {
              setAmount("");
            } else {
              let num = Math.max(0, Math.min(10000, Number(val)));
              setAmount(num.toString());
            }
          }}
          className="w-full p-4 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-inco-blue/40 rounded-full transition-all text-base font-mono"
          disabled={isLoading || !isConnected}
        />
      </div>

      {/* Error Section */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-full text-sm mb-4">
          {error}
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1"></div>

      {/* Action Button - Always at bottom */}
      <button
        onClick={handleMint}
        className="w-full py-4 bg-gradient-to-r from-inco-blue/90 to-inco-blue rounded-full text-white font-bold text-base shadow-lg hover:from-inco-blue hover:to-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono mt-2"
        disabled={!amount || Number(amount) <= 0 || isLoading || !isConnected}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          "Mint cUSDC"
        )}
      </button>
    </div>
  );
};

export default EncryptedTokenInterface;
