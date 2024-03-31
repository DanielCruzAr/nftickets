"use client";

import Web3ContextProvider from "@/context/web3Context";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <Web3ContextProvider>{children}</Web3ContextProvider>
        </AntdRegistry>
    );
}
