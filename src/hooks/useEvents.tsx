import { useEffect, useState } from "react";
import useMarketplaceContract from "./useMarketplaceContract";
import { Event } from "@/types/eventTypes";
import { unixToDateString } from "@/utils/datetimeUtils";

const useEvents = () => {
    const contract = useMarketplaceContract();
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        if (!contract) return;
        let mounted = true;

        const getEvents = async () => {
            try {
                const eventCount = Number(await contract.nextEventId());
                let events_: Event[] = [];
                for (let i = 1; i < eventCount; i++) {
                    const event = await contract.events(i);
                    const eventObj = {
                        id: i,
                        date: unixToDateString(Number(event.startTime)),
                        name: event.name,
                        location: event.location,
                        organizer: event.organizer,
                    };
                    events_.push(eventObj);
                }
                setEvents(events_);
            } catch (e) {
                console.error(e);
            }
        };

        if (mounted) {
            getEvents();
        }

        return () => {
            mounted = false;
        };
    }, [contract]);

    return events;
};

export default useEvents;