"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import useBuyFromOrganizer from "@/hooks/useBuyFromOrganizer";
import useEvent from "@/hooks/useEvent";
import { Button, Card, Form, Layout, Input, InputNumber } from "antd";
import { ToastContainer, toast } from "react-toastify";

const { Content } = Layout;

const toWei = (value: number) => ethers.parseEther(value.toString());

const Event = ({ params: { eventId } }: { params: { eventId: number } }) => {
    const { event, areas, loadingAreas } = useEvent(eventId);
    const { buyFromOrganizer, loading } = useBuyFromOrganizer();
    const [selectedArea, setSelectedArea] = useState<number>();
    const [price, setPrice] = useState<number>(0);
    const [form] = Form.useForm();

    const handleAreaSelect = (areaId: number, areaPrice: number) => {
        setSelectedArea(areaId);
        setPrice(areaPrice);
    };

    const handleBuyTicket = async (values: { amount: number }) => {
        if (!selectedArea) {
            toast.error("Please select an area");
            return;
        }

        const totalPrice = values.amount * price;
        const totalPriceWei = toWei(totalPrice);

        await buyFromOrganizer(
            values.amount,
            eventId.toString(),
            selectedArea.toString(),
            "https://example.com",
            totalPriceWei.toString()
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
                                            selectedArea === area.id
                                                ? "blue"
                                                : "white",
                                    }}
                                    onClick={() =>
                                        handleAreaSelect(area.id, area.price)
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
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Content>
            ) : (
                <h1>Loading...</h1>
            )}
            <ToastContainer />
        </Layout>
    );
};

export default Event;
