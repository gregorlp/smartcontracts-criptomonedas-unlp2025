"use client"

import { createConfig, http } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: false, // Importante para Vercel
})
