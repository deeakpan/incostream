import React, { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { formatEther, WalletClient } from "viem";
import { ENCRYPTED_ERC20_CONTRACT_ADDRESS } from "@/utils/contract";
import { reEncryptValue } from "@/utils/inco-lite";
import EncryptedTokenInterface from "./encrypted-token-interface";
import EncryptedSend from "./encrypted-send";
import ReactDOM from "react-dom";

const EncryptedTokenDashboard = () => {
  const [encryptedBalance, setEncryptedBalance] = useState(0);
  const [isEncryptedLoading, setIsEncryptedLoading] = useState(false);
  const [error, setError] = useState("");

  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { address } = useAccount();

  const refreshBalance = async () => {
    try {
      setIsEncryptedLoading(true);
      setError("");
      const balanceHandle = await publicClient?.readContract({
        address: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "wallet",
                type: "address",
              },
            ],
            name: "balanceOf",
            outputs: [
              {
                internalType: "euint256",
                name: "",
                type: "bytes32",
              },
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
        setEncryptedBalance(0);
        return;
      }

      const decrypted = await reEncryptValue({
        walletClient: walletClient.data as WalletClient,
        handle: balanceHandle?.toString() as string,
      });
      const formattedDecrypted = formatEther(decrypted as bigint);
      setEncryptedBalance(Number(formattedDecrypted));
    } catch (err) {
      console.error("Error refreshing balance:", err);
      setError("Failed to refresh balance");
    } finally {
      setIsEncryptedLoading(false);
    }
  };

  return (
    <div className="md:grid md:grid-cols-2 md:gap-8">
      <EncryptedTokenInterface
        encryptedBalance={encryptedBalance}
        isEncryptedLoading={isEncryptedLoading}
        error={error}
        refreshBalance={refreshBalance}
      />
      <EncryptedSend refreshBalance={refreshBalance} />
    </div>
  );
};

// Simple confirmation modal
export function ConfirmModal({ open, onConfirm, onCancel, address }: { open: boolean; onConfirm: () => void; onCancel: () => void; address: string }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-white/10 rounded-xl shadow-lg p-6 min-w-[300px] flex flex-col items-center">
        <div className="text-white text-sm mb-4">Disconnect wallet <span className="font-mono font-bold">{address?.slice(0, 6)}...{address?.slice(-4)}</span>?</div>
        <div className="flex gap-3 mt-2">
          <button onClick={onCancel} className="px-4 py-1.5 rounded bg-white/10 text-white hover:bg-white/20 transition-colors text-xs">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-1.5 rounded bg-red-500 text-white hover:bg-red-600 transition-colors text-xs font-semibold">Disconnect</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default EncryptedTokenDashboard;
