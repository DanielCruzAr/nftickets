import { useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";

const useBuyFromOrganizer = () => {
    const contract = useMarketplaceContract();
    const [loading, setLoading] = useState(false);

    const buyFromOrganizer = async (
        amount: number,
        eventId: string,
        ticketId: string,
        uri: string,
        price: string
    ) => {
        if (!contract) return;

        setLoading(true);

        try {
            const tx = await contract.buyTicketFromOrganizer(
                amount,
                eventId,
                ticketId,
                uri,
                { value: price }
            );
            await tx.wait();
            window.location.href = "/";
        } catch (e) {
            console.error("Failed to buy ticket from organizer", e);
        } finally {
            setLoading(false);
        }
    };

    return { buyFromOrganizer, loading };
};

export default useBuyFromOrganizer;
