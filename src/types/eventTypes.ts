export interface Event {
    id: number;
    date: string;
    name: string;
    organizer: string;
    location: string;
    // isCancelled: boolean;
    // isCompleted: boolean;
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