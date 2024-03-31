"use client";

import React from "react";

import { IWeb3Context, useWeb3Context } from "@/context/web3Context";
import useEvents from "@/hooks/useEvents";
import { Card } from "antd";

export default function Events() {
    const {
        connectWallet,
        disconnect,
        state: { isAuthenticated, currentChain, provider },
    } = useWeb3Context() as IWeb3Context;

    const events = useEvents();

    return (
        <main className="overflow-hidden bg-white">
            <div>
                {events.map((event, index) => (
                    <Card key={index}>
                        <p>{event.name}</p>
                        <p>{event.location}</p>
                        <p>{event.date}</p>
                        <a href={`/events/${event.id}`}>View</a>
                    </Card>
                ))}
            </div>
        </main>
    );
}
