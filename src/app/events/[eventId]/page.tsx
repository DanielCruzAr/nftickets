"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import useBuyFromOrganizer from "@/hooks/useBuyFromOrganizer";
import useEvent from "@/hooks/useEvent";
import { Button, Card, Form, Layout, Input, InputNumber } from "antd";
import { ToastContainer, toast } from "react-toastify";
import useEventTickets from "@/hooks/useEventTickets";
import TicketCard from "@/components/TicketCard";
import useBuyFromReseller from "@/hooks/useBuyFromReseller";
import { Event as Ev, Area } from "@/types/eventTypes";

const { Content } = Layout;

const toWei = (value: number) => ethers.parseEther(value.toString());

const Event = ({ params: { eventId } }: { params: { eventId: number } }) => {
    const { event, areas, loadingAreas } = useEvent(eventId);
    const { eventTickets } = useEventTickets(eventId);
    const { buyFromOrganizer, loading } = useBuyFromOrganizer();
    const { buyFromReseller, loading: loadingReseller } = useBuyFromReseller();
    const [selectedArea, setSelectedArea] = useState<Area>();
    const [form] = Form.useForm();

    const handleAreaSelect = (area: Area) => {
        setSelectedArea(area);
    };

    const handleBuyTicket = async (values: { amount: number }) => {
        if (!selectedArea) {
            toast.error("Please select an area");
            return;
        }

        const totalPrice = values.amount * selectedArea.price;
        const priceWei = toWei(selectedArea.price);
        const totalPriceWei = toWei(totalPrice);

        await buyFromOrganizer(
            values.amount,
            event as Ev,
            selectedArea,
            priceWei.toString(),
            "https://example.com",
            totalPriceWei.toString()
        );
    };

    const handleBuyFromReseller = async (
        ticketId: number,
        uri: string,
        price: number
    ) => {
        const totalPriceWei = toWei(price);

        await buyFromReseller(
            ticketId, 
            uri, 
            totalPriceWei.toString(),
            (event as Ev).organizerFeePercentage.toString(),
            (event as Ev).organizer
        );
    };

    return (
        <Layout className="layout">
            {!loadingAreas ? (
                <Content>
                    <h1>Event {event?.name}</h1>
                    {areas.length > 0 ? (
                        areas.map((area) => (
                            <Card key={area.id}>
                                <h2>Section: {area.name}</h2>
                                <p>
                                    Available tickets:{" "}
                                    {area.quota - area.soldTickets}
                                </p>
                                <p>Price: {area.price}</p>
                                <Button
                                    style={{
                                        backgroundColor:
                                            selectedArea?.id === area.id
                                                ? "#1890ff"
                                                : "",
                                    }}
                                    onClick={() =>
                                        handleAreaSelect(area)
                                    }
                                >
                                    Select
                                </Button>
                            </Card>
                        ))
                    ) : (
                        <p>No areas available</p>
                    )}
                    <Form
                        form={form}
                        name="basic"
                        initialValues={{ remember: true }}
                        onFinish={handleBuyTicket}
                    >
                        <Form.Item
                            label="Quantity"
                            name="amount"
                            rules={[
                                {
                                    required: true,
                                    type: "number",
                                    message: "Please input the quantity!",
                                    // min: 1,
                                    // max: 4,
                                },
                            ]}
                        >
                            <InputNumber />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                    <div>
                        {eventTickets.length > 0 ? (
                            <div>
                                <h2>Offered Tickets</h2>
                                {eventTickets.map((ticket) => (
                                    <div key={ticket.id}>
                                        <TicketCard
                                            ticket={ticket}
                                            offered={true}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                handleBuyFromReseller(
                                                    ticket.id,
                                                    "https://example.com",
                                                    ticket.price
                                                );
                                            }}
                                            loading={loadingReseller}
                                        >
                                            Buy
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </Content>
            ) : (
                <h1>Loading...</h1>
            )}
            <ToastContainer />
        </Layout>
    );
};

export default Event;
