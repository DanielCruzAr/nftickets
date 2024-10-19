import { BrowserProvider, ethers, JsonRpcSigner } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

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

    const [state, setState] = useState<IWeb3State>(initialWeb3State);

    const connectWallet = useCallback(async () => {
        if (state.isAuthenticated) return;

        try {
            const { ethereum } = window as any;

            if (!ethereum) {
                return toast("Please install MetaMask", { type: "error" });
            }
            const provider = new ethers.BrowserProvider(ethereum);

            const accounts: string[] = await provider.send("eth_requestAccounts", []);

            if (accounts.length > 0) {
                const signer = await provider.getSigner();
                const chain = Number(await (await provider.getNetwork()).chainId);
        
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

    (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
      setState({ ...state, address: accounts[0] });
    });

    (window as any).ethereum.on("networkChanged", (network: string) => {
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
