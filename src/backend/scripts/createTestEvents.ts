import { ethers } from "hardhat";
import ContractAddress from "../contractsData/TicketMarketplace-address.json";
import { getUnixTimestamp } from "../utils/datetimeUtils";

const toWei = (value: number) => ethers.parseEther(value.toString());

async function main() {
    const [deployer, addr1] = await ethers.getSigners();

    const marketplaceFactory = await ethers.getContractFactory(
        "TicketMarketplace"
    );
    const marketplace = marketplaceFactory.attach(
        ContractAddress.address
    ) as any;

    const eventNames = ["Event 1", "Event 2", "Event 3", "Event 4", "Event 5"];
    const eventData = {
        "Event 1": {
            location: "Quezon City",
            startTime: getUnixTimestamp(48),
            ticketTypes: ["Test1", "Test2"],
            ticketPrices: [toWei(1), toWei(1)],
            ticketLimits: [1, 2],
        },
        "Event 2": {
            location: "Manila",
            startTime: getUnixTimestamp(72),
            ticketTypes: ["VIP", "Regular"],
            ticketPrices: [toWei(5), toWei(1)],
            ticketLimits: [10, 100],
        },
        "Event 3": {
            location: "Makati",
            startTime: getUnixTimestamp(96),
            ticketTypes: ["VIP", "Mid", "Poor"],
            ticketPrices: [toWei(10), toWei(5), toWei(0.5)],
            ticketLimits: [5, 10, 100],
        },
        "Event 4": {
            location: "Pasig",
            startTime: getUnixTimestamp(120),
            ticketTypes: ["Backstage", "Regular", "Cheap"],
            ticketPrices: [toWei(2), toWei(1), toWei(0.5)],
            ticketLimits: [10, 50, 200],
        },
        "Event 5": {
            location: "Taguig",
            startTime: getUnixTimestamp(144),
            ticketTypes: ["Area 1", "Area 2", "Area 3", "Area 4", "Area 5", "Area 6", "Area 7", "Area 8", "Area 9", "Area 10"],
            ticketPrices: [toWei(1), toWei(2), toWei(3), toWei(4), toWei(5), toWei(6), toWei(7), toWei(8), toWei(9), toWei(10)],
            ticketLimits: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        },
    };

    try {
        for (const eventName of eventNames) {
            const { location, startTime, ticketTypes, ticketPrices, ticketLimits } =
                eventData[eventName as keyof typeof eventData];
            await marketplace.createEvent(
                eventName,
                startTime,
                location,
                addr1.address,
                5,
                ticketTypes,
                ticketPrices,
                ticketLimits
            );
        }
        console.log("Events created");
    } catch (error) {
        console.error(error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
