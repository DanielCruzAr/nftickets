import { useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";

const useBuyFromOrganizer = () => {
    const contract = useMarketplaceContract();
    const [loading, setLoading] = useState(false);

    const buyFromOrganizer = async (
        eventId: string,
        ticketId: string,
        uri: string,
        price: string
    ) => {
        if (!contract) return;

        setLoading(true);

        try {
            const tx = await contract.buyTicketFromOrganizer(
                eventId,
                ticketId,
                uri,
                { value: price }
            );
            await tx.wait();
        } catch (e) {
            console.error("Failed to buy ticket from organizer", e);
        } finally {
            setLoading(false);
            window.location.href = "/";
        }
    };

    return { buyFromOrganizer, loading };
};

export default useBuyFromOrganizer;
