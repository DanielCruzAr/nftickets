import { useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";

const useBuyFromReseller = () => {
    const contract = useMarketplaceContract();
    const [loading, setLoading] = useState(false);

    const buyFromReseller = async (
        ticketId: number,
        uri: string,
        price: string,
        organizerFeePercentage: string,
        organizer: string
    ) => {
        if (!contract) return;

        setLoading(true);

        try {
            const tx = await contract.purchaseTicket(
                contract,
                ticketId,
                uri,
                organizerFeePercentage,
                organizer,
                { value: price }
            );
            await tx.wait();
            window.location.href = "/tickets";
        } catch (e) {
            console.error("Failed to buy ticket from reseller", e);
        } finally {
            setLoading(false);
        }
    };

    return { buyFromReseller, loading };
};

export default useBuyFromReseller;
