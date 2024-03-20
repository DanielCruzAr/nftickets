import { BrowserProvider, ethers, JsonRpcSigner } from "ethers";
import { useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

export interface IWeb3State {
    address: string | null;
    currentChain: number | null;
    signer: JsonRpcSigner | null;
    provider: BrowserProvider | null;
    isAuthenticated: boolean;
}

const useWeb3Provider = () => {
    const initialWeb3State = {
        address: null,
        currentChain: null,
        signer: null,
        provider: null,
        isAuthenticated: false,
    };

    const toast = useToast();
    const [state, setState] = useState<IWeb3State>(initialWeb3State);

    const connectWallet = useCallback(async () => {
        if (state.isAuthenticated) return;

        try {
            const { ethereum } = window as any;

            if (!ethereum) {
                return toast({
                    title: "Error",
                    description: "Please install MetaMask",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
            const provider = new ethers.BrowserProvider(ethereum);

            const accounts: string[] = await provider.send(
                "eth_requestAccounts",
                []
            );

            if (accounts.length > 0) {
                const signer = await provider.getSigner();
                const chain = Number(
                    await (
                        await provider.getNetwork()
                    ).chainId
                );

                setState({
                    ...state,
                    address: accounts[0],
                    signer,
                    currentChain: chain,
                    provider,
                    isAuthenticated: true,
                });

                localStorage.setItem("isAuthenticated", "true");
            }
        } catch {}
    }, [state, toast]);

    const disconnect = () => {
        setState(initialWeb3State);
        localStorage.removeItem("isAuthenticated");
    };

    useEffect(() => {
        if (window === null) return;

        if (localStorage.hasOwnProperty("isAuthenticated")) {
            connectWallet();
        }
    }, [connectWallet, state.isAuthenticated]);

    useEffect(() => {
        if (typeof (window as any).ethereum === "undefined") return;

        (window as any).ethereum.on("accountsChanged", (network: string[]) => {
            setState({ ...state, currentChain: Number(network) });
        });

        return () => {
            (window as any).ethereum.removeAllListeners();
        };
    }, [state]);

    return {
        connectWallet,
        disconnect,
        state,
    };
};

export default useWeb3Provider;
