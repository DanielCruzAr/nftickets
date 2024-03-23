"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@chakra-ui/next-js";
import Head from "next/head";
import { Button, Card, HStack } from "@chakra-ui/react";
import { IWeb3Context, useWeb3Context } from "@/context/web3Context";
import useEvents from "@/hooks/useEvents";

const ChainID = 1337;

export default function Home() {
    const {
        connectWallet,
        disconnect,
        state: { isAuthenticated, address, currentChain, provider },
    } = useWeb3Context() as IWeb3Context;

    const events = useEvents();

    const correctNetwork = useMemo(() => {
        return currentChain === ChainID;
    }, [currentChain]);

    return (
        <div>
            <Head>
                <title>Next + Ethers dApp</title>
            </Head>
            <HStack
                width="full"
                as="header"
                height="80px"
                px={4}
                alignItems="center"
                bg="gray.100"
            >
                <HStack as="nav" width="full" justifyContent="space-between">
                    <HStack>
                        {!isAuthenticated ? (
                            <Button
                                onClick={connectWallet}
                                variant="solid"
                                bg="blue.400"
                                colorScheme="blue"
                                gap={2}
                                color="white"
                            >
                                {/* <Icon as={FaEthereum} /> */}
                                Connect wallet
                            </Button>
                        ) : (
                            <Button
                                onClick={disconnect}
                                variant="solid"
                                bg="red.400"
                                colorScheme="red"
                                color="white"
                                gap={2}
                            >
                                {/* <Icon as={BiLogOut} /> */}
                                Disconnect
                            </Button>
                        )}
                    </HStack>
                </HStack>
            </HStack>
            {isAuthenticated &&
                (correctNetwork ? (
                    <div>
                        {events.map((event, index) => (
                            <Card key={index} p={4} my={4}>
                                <p>{event.name}</p>
                                <p>{event.organizer}</p>
                                <Link href={`/events/${event.id}`}>View</Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p>Wrong network</p>
                ))}
        </div>
    );
}
