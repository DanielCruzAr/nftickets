import { useState, useEffect } from "react";
import { IWeb3Context, useWeb3Context } from "@/context/web3Context";
import axios from "axios";

interface WalletResponse {
    chain: string;
    address: string;
}

interface RequestBody {
    email: string;
    chain: string;
}

interface ApiResponse {
    wallet: WalletResponse;
}

const useCreateWallet = () => {
    const clientSecret = `${process.env.CROSSMINT_CLIENT_SECRET}` || "";
    const projectId = `${process.env.CROSSMINT_PROJECT_ID}` || "";
    const {
        state: { currentChain },
    } = useWeb3Context() as IWeb3Context;
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const createWallet = async (userEmail: string) => {
        setLoading(true);
        console.log("clientSecret: ", clientSecret);
        console.log("projectId: ", projectId);
        
        try {
            const requestBody: RequestBody = {
                email: userEmail,
                chain: currentChain?.toString() || "",
            };

            const response = await axios.post<ApiResponse>(
                "https://staging.crossmint.com/api/v1-alpha1/wallets",
                requestBody,
                {
                    headers: {
                        "X-PROJECT-ID": projectId,
                        "X-CLIENT-SECRET": clientSecret,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data.wallet;
        } catch (error) {
            console.error(error);
            setError(String(error) || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return { createWallet, error, loading };
};

export default useCreateWallet;
