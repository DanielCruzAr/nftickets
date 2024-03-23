import { useEffect, useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";
import { Event, Area } from "@/types/eventTypes";
import { ethers } from "ethers";

const fromWei = (value: string) => ethers.formatEther(value);

const useEvent = (eventId: number) => {
    const contract = useMarketplaceContract();
    const [event, setEvent] = useState<Event | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);

    useEffect(() => {
        if (!contract) return;
        let mounted = true;

        const getEventInfo = async () => {
            try {
                const event = await contract.events(eventId);
                const eventObj = {
                    id: eventId,
                    name: event.name,
                    organizer: event.organizer,
                };
                const areasCount = Number(event.totalAreas);
                const areas_: Area[] = [];
                for (let i = 1; i <= areasCount; i++) {
                    const area = await contract.getArea(eventId, i);
                    const areaObj = {
                        id: i,
                        name: area.area,
                        price: Number(fromWei(area.price)),
                        quota: Number(area.quota),
                        soldTickets: Number(area.soldTickets),
                    };
                    areas_.push(areaObj);
                }
                setAreas(areas_);
                setEvent(eventObj);
            } catch (e) {
                console.error(e);
            }
        };

        if (mounted) {
            getEventInfo();
        }

        return () => {
            mounted = false;
        };
    }, []);

    return { event, areas };
};

export default useEvent;
