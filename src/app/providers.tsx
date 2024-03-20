"use client";

import Web3ContextProvider from "@/context/web3Context";
import { ChakraProvider } from "@chakra-ui/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider>
            <Web3ContextProvider>{children}</Web3ContextProvider>
        </ChakraProvider>
    );
}
