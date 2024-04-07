import { useState } from "react";
import { Button, Card } from "antd";
import React from "react";
import { Ticket } from "@/types/eventTypes";

const TicketCard = ({
    ticket,
    offered = false,
    ...props
}) => {
    return (
        <Card>
            <p>Event ID: {ticket.eventId}</p>
            <p>Area ID: {ticket.areaId}</p>
            <p>Price: {ticket.price}</p>
            <p>Owner: {ticket.owner}</p>
            <p>Times Sold: {ticket.timesSold}</p>
            <p>Used: {ticket.used ? "True" : "False"}</p>
            {!offered ? (
                <Button
                    style={{
                        backgroundColor:
                            props.offeredTicket === ticket.id ? "#1890ff" : "",
                    }}
                    onClick={() => props.setOfferedTicket(ticket.id)}
                >
                    Offer ticket
                </Button>
            ) : null}
        </Card>
    );
};

export default TicketCard;
