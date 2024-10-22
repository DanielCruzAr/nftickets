import { useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";
import { Event, Area } from "@/types/eventTypes";
import { getUnixTimestampFromISO } from "@/backend/utils/datetimeUtils";

const useBuyFromOrganizer = () => {
    const contract = useMarketplaceContract();
    const [loading, setLoading] = useState(false);

    const buyFromOrganizer = async (
        amount: number,
        event: Event,
        area: Area,
        price: string,
        uri: string,
        totalPrice: string
    ) => {
        if (!contract) return;

        setLoading(true);

        try {
            const soldTickets = area.soldTickets
            const timestamp = getUnixTimestampFromISO(event.startTime) 
            const isValid = await contract.validatePurchase(
                amount, 
                event.organizer, 
                area.quota, 
                timestamp,
                soldTickets,
                event.isCancelled,
                event.isCompleted
            )
            const tx = await contract.buyTicketFromOrganizer(
                isValid,
                amount,
                event.id,
                area.id,
                event.organizer,
                price,
                uri,
                { value: totalPrice }
            );
            await tx.wait();
            await fetch(`http://localhost:4000/areas/${area.id}`, { // TODO: Use env variable
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ soldTickets: soldTickets + amount }),
            });
            window.location.href = "/tickets";
        } catch (e) {
            console.error("Failed to buy ticket from organizer", e);
        } finally {
            setLoading(false);
        }
    };

    return { buyFromOrganizer, loading };
};

export default useBuyFromOrganizer;
