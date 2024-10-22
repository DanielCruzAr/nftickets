import { useEffect, useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";
import { Ticket } from "@/types/eventTypes";
import { ethers } from "ethers";

const fromWei = (value: string) => ethers.formatEther(value);

const useEventTickets = (eventId: number) => {
    const contract = useMarketplaceContract();
    const [eventTickets, setEventTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        if (!contract) return;
        let mounted = true;

        const getFilterResults = async (filter: any) => {
            const ticketSet = new Set();
            const tickets: Ticket[] = (
                await Promise.all(
                    filter.map(async (i: any) => {
                        i = i.args;
                        if (ticketSet.has(i.ticketId)) return null;
                        ticketSet.add(i.ticketId);
                        const ticket = await contract.tickets(i.ticketId);
                        if (!ticket.offered) return null;
                        return {
                            id: Number(i.ticketId),
                            eventId: Number(ticket.eventId),
                            areaId: Number(ticket.areaId),
                            price: Number(fromWei(ticket.price)),
                            owner: ticket.owner,
                            timesSold: Number(ticket.timesSold),
                            used: ticket.used,
                        };
                    })
                )
            ).filter((ticket): ticket is Ticket => ticket !== null);
            return tickets;
        };

        const getOfferedTickets = async () => {
            try {
                const offeredFilter = contract.filters.Offered(
                    null,
                    eventId,
                    null,
                    null,
                    null
                );
                const results = await contract.queryFilter(offeredFilter);
                const tickets = await getFilterResults(results);
                setEventTickets(tickets);
            } catch (e) {
                console.error(e);
            }
        };

        if (mounted) {
            getOfferedTickets();
        }

        return () => {
            mounted = false;
        };
    }, [contract]);

    return { eventTickets };
};

export default useEventTickets;
