import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWalletClient, usePublicClient } from "wagmi";
import { ethers, utils as ethersUtils } from "ethers";
import { formatEther, WalletClient } from "viem";
import { ENCRYPTED_ERC20_CONTRACT_ADDRESS, CONFIDENTIAL_AUCTION_CONTRACT_ADDRESS, CONFIDENTIAL_AUCTION_ABI } from "@/utils/contract";
import { encryptValue, reEncryptValue } from "@/utils/inco-lite";

interface BidModalProps {
  minBid: string; // in wei (string)
  auctionId: string;
  onClose: () => void;
}

export default function BidModal({ minBid, auctionId, onClose }: BidModalProps) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const fetchAndDecryptBalance = async () => {
    if (!address || !walletClient || !publicClient) return;
    setDecrypting(true);
    try {
      const balanceHandle = await publicClient.readContract({
        address: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "wallet", type: "address" },
            ],
            name: "balanceOf",
            outputs: [
              { internalType: "euint256", name: "", type: "bytes32" },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      });
      if (
        balanceHandle?.toString() ===
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        setBalance("0.00");
        setDecrypting(false);
        setLoading(false);
        return;
      }
      const decrypted = await reEncryptValue({
        walletClient: walletClient as WalletClient,
        handle: balanceHandle?.toString() as string,
      });
      const formattedDecrypted = formatEther(decrypted as bigint);
      setBalance(Number(formattedDecrypted).toLocaleString(undefined, { maximumFractionDigits: 2 }));
    } catch (e) {
      setBalance("0.00");
    } finally {
      setDecrypting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAndDecryptBalance();
    // eslint-disable-next-line
  }, [address, walletClient, publicClient]);

  const minBidEth = ethers.utils.formatUnits(minBid, 18);
  const balanceNum = parseFloat(balance.replace(/,/g, ""));
  const minBidNum = parseFloat(minBidEth);
  const amountNum = parseFloat(amount);

  useEffect(() => {
    if (!amount) {
      setError("");
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount");
    } else if (amountNum < minBidNum) {
      setError(`Bid must be at least ${minBidNum} cUSDC`);
    } else if (amountNum > balanceNum) {
      setError("Insufficient cUSDC balance");
    } else {
      setError("");
    }
  }, [amount, minBidNum, balanceNum]);

  const handleBid = async () => {
    if (error || !amount || !address) return;
    setSubmitting(true);
    try {
      // Encrypt the bid amount using Inco SDK
      const encryptedBid = await encryptValue({
        value: ethers.utils.parseUnits(amount, 18).toBigInt(),
        address,
        contractAddress: CONFIDENTIAL_AUCTION_CONTRACT_ADDRESS,
      });
      // Call the contract's bid function
      await writeContractAsync({
        address: CONFIDENTIAL_AUCTION_CONTRACT_ADDRESS,
        abi: CONFIDENTIAL_AUCTION_ABI,
        functionName: "bid",
        args: [auctionId, encryptedBid],
      });
      onClose();
    } catch (e) {
      setError("Bid failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-inco-navy rounded-lg p-5 max-w-xs w-full relative shadow-xl border border-inco-blue" style={{ minWidth: 0 }}>
        <button className="absolute top-2 right-3 text-white/60 hover:text-white text-2xl font-bold" onClick={onClose}>&times;</button>
        <div className="mb-2 text-lg font-semibold text-white">Place a Bid</div>
        <div className="mb-2 text-sm text-white/70">Auction #{auctionId}</div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-white/60">Your cUSDC Balance:</span>
          <span className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{loading ? "..." : balance}</span>
            <button
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors disabled:opacity-40"
              onClick={fetchAndDecryptBalance}
              disabled={decrypting || loading}
              title="Decrypt/Reload Balance"
              type="button"
            >
              {decrypting ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
              )}
            </button>
          </span>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-white/60">Min Bid:</span>
          <span className="text-sm font-bold text-white">{minBidNum} cUSDC</span>
        </div>
        <input
          type="number"
          min={minBidNum}
          step="0.01"
          placeholder={`Enter bid (min ${minBidNum})`}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full p-2 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-inco-blue/40 rounded mb-2 text-base"
          disabled={submitting}
        />
        {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
        <button
          className="w-full py-2 bg-inco-blue rounded text-white font-medium hover:bg-inco-blue/90 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleBid}
          disabled={!!error || !amount || submitting}
        >
          {submitting ? "Submitting..." : "Submit Bid"}
        </button>
      </div>
    </div>
  );
} 