import { useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";
import { ethers } from "ethers";

const toWei = (value: number) => ethers.parseEther(value.toString());

const useOfferTicket = () => {
    const contract = useMarketplaceContract();
    const [loading, setLoading] = useState(false);

    const offerTicket = async (ticketId: number, price: number) => {
        if (!contract) return;

        setLoading(true);

        try {
            const tx = await contract.offerTicket(ticketId, toWei(price));
            await tx.wait();
            window.location.href = "/";
        } catch (e) {
            console.error("Failed to offer ticket", e);
        } finally {
            setLoading(false);
        }
    };

    return { offerTicket, loading };
};

export default useOfferTicket;
