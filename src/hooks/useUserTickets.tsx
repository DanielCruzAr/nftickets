import { useEffect, useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";
import { Ticket } from "@/types/eventTypes";
import { ethers } from "ethers";

const fromWei = (value: string) => ethers.formatEther(value);

const useUserTickets = (address: string) => {
    const contract = useMarketplaceContract();
    const [userTickets, setUserTickets] = useState<Ticket[]>([]);
    const [offeredTickets, setOfferedTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        if (!contract) return;
        let mounted = true;

        const getFilterResults = async (
            filter: any,
            bought: boolean = true
        ) => {
            const tickets: Ticket[] = (
                await Promise.all(
                    filter.map(async (i: any) => {
                        i = i.args;
                        let nftOwner: string = await contract.ownerOf(
                            i.ticketId
                        );
                        if (nftOwner.toLowerCase() !== address) return null; //TODO: check if addresses are case sensitive
                        const ticket = await contract.tickets(i.ticketId);
                        if (ticket.offered && bought) {
                            return null;
                        }
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

        const getUserTickets = async () => {
            try {
                const boughtFilter = contract.filters.Bought(
                    null,
                    null,
                    null,
                    address
                );
                const offeredFilter = contract.filters.Offered(
                    null,
                    null,
                    null,
                    null,
                    address
                );
                const boughtResults = await contract.queryFilter(boughtFilter);
                const offeredResults = await contract.queryFilter(
                    offeredFilter
                );
                const tickets = await getFilterResults(boughtResults);
                const offered = await getFilterResults(offeredResults, false);
                setUserTickets(tickets);
                setOfferedTickets(offered);
            } catch (e) {
                console.error(e);
            }
        };

        if (mounted) {
            getUserTickets();
        }

        return () => {
            mounted = false;
        };
    }, [contract]);

    return { userTickets, offeredTickets };
};

export default useUserTickets;
