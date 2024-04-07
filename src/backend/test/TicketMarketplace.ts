import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { getUnixTimestamp } from "../utils/datetimeUtils";

const toWei = (value: number) => hre.ethers.parseEther(value.toString());
const fromWei = (value: any) => hre.ethers.formatEther(value);

describe("TicketMarketplace", function () {
    const name = "Ticket";
    const symbol = "TK";
    const percentageFee = 1;
    const organizerFee = 5;
    const price1 = 2;
    const price2 = 2;
    const uri = "https://example.com/token/";
    const eventDate = getUnixTimestamp(24);
    let nextEventId = 1;
    let owner: any;
    let addr1: any;
    let addr2: any;
    let addrs: any;

    async function setup() {
        [owner, addr1, addr2, ...addrs] = await hre.ethers.getSigners();

        const ticketMarketplace = await hre.ethers.deployContract(
            "TicketMarketplace",
            [name, symbol, percentageFee]
        );

        await ticketMarketplace.createEvent(
            "Event 1",
            eventDate,
            "City",
            addr1.address,
            organizerFee,
            ["Area 1", "Area 2"],
            [toWei(price1), toWei(price2)],
            [5, 1]
        );
        nextEventId++;

        return {
            ticketMarketplace,
        };
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { ticketMarketplace } = await loadFixture(setup);
            expect(await ticketMarketplace.owner()).to.equal(owner.address);
        });

        it("Should set the right name, symbol and percentage fee", async function () {
            const { ticketMarketplace } = await loadFixture(setup);
            expect(await ticketMarketplace.name()).to.equal(name);
            expect(await ticketMarketplace.symbol()).to.equal(symbol);
            // expect(await ticketMarketplace.percentageFee()).to.equal(
            //     percentageFee
            // );
        });
    });

    describe("Create event", function () {
        it("Should create an event", async function () {
            const { ticketMarketplace } = await loadFixture(setup);
            const eventName = "New Event";
            const organizer = addr1.address;
            const organizerFee = 5;
            const areas = ["Area 1", "Area 2", "Area 3"];
            const prices = [toWei(1), toWei(2), toWei(5)];
            const quotas = [20, 10, 5];

            await ticketMarketplace.createEvent(
                eventName,
                eventDate,
                "City",
                organizer,
                organizerFee,
                areas,
                prices,
                quotas
            );
            const event = await ticketMarketplace.events(nextEventId);
            expect(event.name).to.equal(eventName);
            expect(event.organizer).to.equal(organizer);
            expect(event.organizerFeePercentage).to.equal(organizerFee);
            nextEventId++;
        });
    });

    describe("Buy ticket from organizer", function () {
        it("Should buy a ticket from organizer", async function () {
            const { ticketMarketplace } = await loadFixture(setup);
            const totalPriceWei = toWei(price1);
            const organizerInitialBalance =
                await hre.ethers.provider.getBalance(addr1.address);
            const ownerInitialBalance = await hre.ethers.provider.getBalance(
                owner.address
            );
            const amountOwner = price1 * (percentageFee / 100);
            const amountOrganizer = price1 - amountOwner;

            await ticketMarketplace
                .connect(addr2)
                .buyTicketFromOrganizer(1, 1, 1, uri, {
                    value: totalPriceWei,
                });

            const buyedTicket = await ticketMarketplace.tickets(1);
            expect(buyedTicket.owner).to.equal(addr2.address, "Owner is wrong");
            expect(await ticketMarketplace.ownerOf(1)).to.equal(
                addr2.address,
                "Owner is wrong"
            );
            expect(buyedTicket.price).to.equal(totalPriceWei, "Price is wrong");
            expect(buyedTicket.timesSold).to.equal(1, "Times sold is wrong");
            expect(buyedTicket.used).to.equal(false, "Used is wrong");
            expect(buyedTicket.offered).to.equal(false, "Offered is wrong");

            const area = await ticketMarketplace.getArea(1, 1);
            expect(area.soldTickets).to.equal(1, "Sold tickets is wrong");

            const ownerFinalBalance = await hre.ethers.provider.getBalance(
                owner.address
            );
            const organizerFinalBalance = await hre.ethers.provider.getBalance(
                addr1.address
            );

            expect(+fromWei(ownerFinalBalance)).to.equal(
                +fromWei(ownerInitialBalance) + amountOwner,
                "Owner balance is wrong"
            );
            expect(+fromWei(organizerFinalBalance)).to.equal(
                +fromWei(organizerInitialBalance) + amountOrganizer,
                "Organizer balance is wrong"
            );

            // emit Bought event
            const emittedEvent = await ticketMarketplace.queryFilter(
                ticketMarketplace.filters.Bought()
            );
            expect(emittedEvent.length).to.equal(1);
        });
    });

    describe("Offer ticket", function () {
        it("Should offer a ticket", async function () {
            const { ticketMarketplace } = await loadFixture(setup);
            const contractAddress = await ticketMarketplace.getAddress();
            const priceOffer = toWei(1.5);

            await ticketMarketplace
                .connect(addr2)
                .buyTicketFromOrganizer(1, 1, 1, uri, {
                    value: toWei(price1),
                });

            await ticketMarketplace.connect(addr2).offerTicket(1, priceOffer);

            const ticket = await ticketMarketplace.tickets(1);
            expect(ticket.price).to.equal(priceOffer);
            expect(ticket.offered).to.equal(true);
            expect(await ticketMarketplace.getApproved(1)).to.equal(
                contractAddress
            );
        });
    });

    describe("Buy ticket from reseller", function () {
        it("Should buy a ticket from reseller", async function () {
            const { ticketMarketplace } = await loadFixture(setup);
            const contractAddress = await ticketMarketplace.getAddress();

            // Buy ticket from organizer
            const totalPriceWei = toWei(price1);
            const priceOffer = 2.5;
            const priceOfferWei = toWei(1.5);
            await ticketMarketplace
                .connect(addrs[0])
                .buyTicketFromOrganizer(1, 1, 1, uri, {
                    value: totalPriceWei,
                });

            const ownerInitialBalanceWei = await hre.ethers.provider.getBalance(
                owner.address
            );
            const ownerInitialBalance = Number(+fromWei(ownerInitialBalanceWei));
            const organizerInitialBalance =
                await hre.ethers.provider.getBalance(addr1.address);
            const resellerInitialBalance = await hre.ethers.provider.getBalance(
                addrs[0].address
            );

            await ticketMarketplace
                .connect(addrs[0])
                .offerTicket(1, priceOfferWei);
            await ticketMarketplace
                .connect(addrs[1])
                .purchaseTicket(contractAddress, 1, uri, {
                    value: priceOfferWei,
                });

            // Test ticket data
            const buyedTicket = await ticketMarketplace.tickets(1);
            expect(buyedTicket.owner).to.equal(
                addrs[1].address,
                "Owner is wrong"
            );
            expect(await ticketMarketplace.ownerOf(1)).to.equal(
                addrs[1].address,
                "Owner is wrong"
            );
            expect(buyedTicket.price).to.equal(priceOfferWei, "Price is wrong");
            expect(buyedTicket.timesSold).to.equal(2, "Times sold is wrong");
            expect(buyedTicket.offered).to.equal(false, "Offered is wrong");

            // Test emitted events
            const emittedEvent = await ticketMarketplace.queryFilter(
                ticketMarketplace.filters.Bought()
            );
            expect(emittedEvent.length).to.equal(2);

            // Test balances
            const amountOwner = priceOffer * (percentageFee / 100);
            const amountOrganizer = priceOffer * (organizerFee / 100);
            const ownerFinalBalanceWei = await hre.ethers.provider.getBalance(
                owner.address
            );
            const ownerFinalBalance = Number(+fromWei(ownerFinalBalanceWei));
            console.log("balances: ", ownerFinalBalance - ownerInitialBalance);
            const organizerFinalBalance = await hre.ethers.provider.getBalance(
                addr1.address
            );
            const resellerFinalBalance = await hre.ethers.provider.getBalance(
                addrs[0].address
            );
            expect(ownerFinalBalance).to.equal(
                ownerInitialBalance + amountOwner,
                "Owner balance is wrong"
            );
            expect(+fromWei(organizerFinalBalance)).to.equal(
                +fromWei(organizerInitialBalance) + amountOrganizer,
                "Organizer balance is wrong"
            );
            expect(+fromWei(resellerFinalBalance)).to.equal(
                +fromWei(resellerInitialBalance) +
                    priceOffer -
                    amountOrganizer -
                    amountOwner,
                "Reseller balance is wrong"
            );
        });
    });
});
