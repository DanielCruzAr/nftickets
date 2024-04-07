import { useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";

const useBuyFromReseller = () => {
    const contract = useMarketplaceContract();
    const [loading, setLoading] = useState(false);

    const buyFromReseller = async (
        ticketId: number,
        uri: string,
        price: string
    ) => {
        if (!contract) return;

        setLoading(true);

        try {
            const tx = await contract.purchaseTicket(
                contract,
                ticketId,
                uri,
                { value: price }
            );
            await tx.wait();
            window.location.href = "/";
        } catch (e) {
            console.error("Failed to buy ticket from reseller", e);
        } finally {
            setLoading(false);
        }
    };

    return { buyFromReseller, loading };
};

export default useBuyFromReseller;
