import { useEffect, useState } from "react";
import { Event, Area } from "@/types/eventTypes";

const useEvent = (eventId: number) => {
    // const contract = useMarketplaceContract();
    const [event, setEvent] = useState<Event | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);
    const [loadingAreas, setLoadingAreas] = useState(true);

    useEffect(() => {
        let mounted = true;

        const getEventInfo = async () => {
            
            try {
                const eventResponse = await fetch(`http://localhost:4000/events/${eventId}`); // TODO: Use env variable
                const areaResponse = await fetch(`http://localhost:4000/areas/?eventId=${eventId}`); // TODO: Use env variable
                const event_: Event = await eventResponse.json();
                const areas_: Area[] = await areaResponse.json();
                setAreas(areas_);
                setEvent(event_);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingAreas(false);
            }
        };

        if (mounted) {
            getEventInfo();
        }

        return () => {
            mounted = false;
        };
    }, []);

    return { event, areas, loadingAreas };
};

export default useEvent;
