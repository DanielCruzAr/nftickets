import { useEffect, useState } from "react";
import { Event } from "@/types/eventTypes";

const useEvents = () => {
    // const contract = useMarketplaceContract();
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        let mounted = true;

        const getEvents = async () => {
            try {
                const response = await fetch("http://localhost:4000/events"); // TODO: Use env variable
                const events_: Event[] = await response.json();

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
    }, []);

    return events;
};

export default useEvents;
