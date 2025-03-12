"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useState, useEffect } from "react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { baseSepolia } from "wagmi/chains";

const projectId = "be36d80bd82aef7bdb958bb467c3e570";

const initializeWeb3Modal = () => {
  try {
    const metadata = {
      name: "My App",
      description: "My App Description",
      url: "https://myapp.com",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };

    const chains = [baseSepolia];

    const wagmiConfig = defaultWagmiConfig({
      chains,
      projectId,
      metadata,
    });

    createWeb3Modal({
      wagmiConfig,
      projectId,
      chains,
      enableAnalytics: true,
      themeMode: "dark",
      chainImages: {
        [baseSepolia.id]:
          "https://images.mirror-media.xyz/publication-images/cgqxxPdUFBDjgKna_dDir.png?height=1200&width=1200",
      },
    });

    console.log("Web3Modal initialized successfully");
    return wagmiConfig;
  } catch (error) {
    console.error("Failed to initialize Web3Modal:", error);
    throw error;
  }
};

export function Web3Provider({ children, initialState }) {
  const [queryClient] = useState(() => new QueryClient());
  const [wagmiConfig, setWagmiConfig] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialized) {
      try {
        const config = initializeWeb3Modal();
        setWagmiConfig(config);
        setInitialized(true);
      } catch (err) {
        console.error("Web3Provider initialization error:", err);
        setError(err);
      }
    }
  }, [initialized]);

  if (error) {
    return <div>Failed to initialize wallet connection: {error.message}</div>;
  }

  if (!initialized || !wagmiConfig) {
    return <div>Initializing wallet connection...</div>;
  }

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
