"use client";

import { useState } from "react";
import { useWeb3Context, IWeb3Context } from "@/context/web3Context";
import useUserTickets from "@/hooks/useUserTickets";
import { Button, Form, InputNumber } from "antd";
import useOfferTicket from "@/hooks/useOfferTicket";
import TicketCard from "@/components/TicketCard";

export default function MyTickets() {
    const {
        state: { address },
    } = useWeb3Context() as IWeb3Context;
    const { offerTicket, loading } = useOfferTicket();
    const { userTickets, offeredTickets } = useUserTickets(
        address ? address : "", null
    );
    const [offeredTicket, setOfferedTicket] = useState<number>(0);
    const [form] = Form.useForm();

    const handleOfferTicket = async (values: { price: number }) => {
        if (!offeredTicket) return;

        await offerTicket(offeredTicket, values.price);
    };

    return (
        <main className="overflow-hidden bg-white">
            <div>
                <h1>My Tickets</h1>
            </div>
            <div>
                <h2>Address: {address}</h2>
            </div>
            <div>
                <h2>Tickets</h2>
                <ul>
                    {userTickets.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            offeredTicket={offeredTicket}
                            setOfferedTicket={setOfferedTicket}
                        />
                    ))}
                </ul>
            </div>
            <div>
                {offeredTicket > 0 ? (
                    <Form
                        form={form}
                        name="offerTicket"
                        onFinish={handleOfferTicket}
                    >
                        <Form.Item
                            label="Price"
                            name="price"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input the price",
                                },
                            ]}
                        >
                            <InputNumber />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Offer
                            </Button>
                        </Form.Item>
                    </Form>
                ) : null}
            </div>
            <div>
                {offeredTickets.length > 0 ? (
                    <div>
                        <h2>Offered Tickets</h2>
                        {offeredTickets.map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                offered={true}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </main>
    );
}
