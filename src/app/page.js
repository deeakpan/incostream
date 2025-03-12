"use client";
import DecryptButton from "@/components/DecryptButton";
import NumberInputForm from "@/components/NumberInputForm";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // This ensures hydration is complete before rendering wallet-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle the disconnect action
  const handleDisconnect = async () => {
    try {
      await disconnect();
      // Force a small delay to ensure state is properly cleared
      setTimeout(() => {
        window.location.reload(); // Optional: only use if the issue persists
      }, 100);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  // Handler for the connect button
  const handleConnect = () => {
    try {
      console.log('Connecting wallet...');
      open();
    } catch (error) {
      console.error("Connect error:", error);
    }
  };

  // Don't render wallet-dependent UI until client-side hydration is complete
  if (!mounted) return <div className="p-6 max-w-4xl mx-auto">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Template</h1>
        <div>
          {isConnected ? (
            <div className="flex items-center gap-4">
              <span className="text-sm truncate max-w-[150px]">
                {address?.substring(0, 6)}...
                {address?.substring(address.length - 4)}
              </span>
              <button
                onClick={handleDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-12 grid">
          <NumberInputForm />
          <DecryptButton />
        </div>
      ) : (
        <div className="text-center p-10 border border-gray-200/40 rounded-lg">
          <p>Connect your wallet to continue</p>
        </div>
      )}
    </div>
  );
}
