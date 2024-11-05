"use client";

import Web3ContextProvider from "@/context/web3Context";

export function Providers({ children }: { children: React.ReactNode }) {
    return <Web3ContextProvider>{children}</Web3ContextProvider>;
}
