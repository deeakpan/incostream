"use client";

import React, { ReactNode } from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia } from "wagmi/chains";

const projectId = "be36d80bd82aef7bdb958bb467c3e570";

const metadata = {
  name: "Inco Nextjs Template",
  description: "Inco Nextjs Template",
  url: "https://www.inco.org",
  icons: [
    "https://cdn.prod.website-files.com/671156d33ac264346e223043/675a2a83d4ac40cf1352048c_logo%20(24).png",
  ],
};

const chains = [baseSepolia] as const;

const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: true,
  themeMode: "dark",
  chainImages: {
    [baseSepolia.id]:
      "https://images.mirror-media.xyz/publication-images/cgqxxPdUFBDjgKna_dDir.png?height=1200&width=1200",
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}