export interface Event {
    id: number;
    name: string;
    location: string;
    isCancelled: boolean;
    isCompleted: boolean;
    startTime: string;
    organizer: string;
    organizerFeePercentage: number;
    totalAreas: number;
}

export interface Area {
    id: number;
    name: string;
    price: number;
    quota: number;
    soldTickets: number;
}

export interface Ticket {
    id: number;
    eventId: number;
    areaId: number;
    price: number;
    owner: string;
    timesSold: number;
    used: boolean;
}