export interface Event {
    id: number;
    name: string;
    organizer: string;
    // location: string;
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