"use client";

import React, { useEffect } from "react";
import { ethers } from "ethers";
import useBuyFromOrganizer from "@/hooks/useBuyFromOrganizer";
import useEvent from "@/hooks/useEvent";
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
} from "@chakra-ui/react";

const toWei = (value: number) => ethers.parseEther(value.toString());

const Event = ({ params: { eventId } }: { params: { eventId: number } }) => {
    const { event, areas } = useEvent(eventId);
    const { buyFromOrganizer, loading } = useBuyFromOrganizer();

    const handleBuyTicket = async (areaId: number, price: number) => {
        await buyFromOrganizer(
            eventId.toString(),
            areaId.toString(),
            "https://example.com",
            toWei(price).toString()
        );
    };

    return (
        <div>
            <h1>Event {event?.name}</h1>
            {areas.map((area) => (
                <div key={area.id}>
                    <Card p={4} my={4}>
                        <CardHeader>
                            <h2>{area.name}</h2>
                        </CardHeader>
                        <CardBody>
                            <p>Price: {area.price}</p>
                            <p>Quota: {area.quota}</p>
                            <p>Sold Tickets: {area.soldTickets}</p>
                        </CardBody>
                        <CardFooter>
                            <Button
                                onClick={() => handleBuyTicket(area.id, area.price)}
                                isLoading={loading}
                            >
                                Buy Ticket
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    );
};

export default Event;
