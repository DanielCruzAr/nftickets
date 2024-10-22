import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { getUnixTimestamp } from "../utils/datetimeUtils";

const toWei = (value: number) => hre.ethers.parseEther(value.toString());
const fromWei = (value: any) => hre.ethers.formatEther(value);

const buyTicket = async (
    ticketMarketplace: any,
    buyer: any,
    event: any,
    area: any,
    uri: any,
    price: any
) => {
    const isValid = await ticketMarketplace
        .connect(buyer)
        .validatePurchase(
            1,
            event.organizer,
            area.quota,
            event.startTime,
            area.soldTickets,
            event.isCancelled,
            event.isCompleted
        );
    await ticketMarketplace
        .connect(buyer)
        .buyTicketFromOrganizer(
            isValid,
            1,
            event.id,
            area.id,
            event.organizer,
            area.price,
            uri,
            {
                value: price,
            }
        );
};

const purchaseTicket = async (
    ticketMarketplace: any,
    buyer: any,
    contractAddress: any,
    ticketId: any,
    uri: any,
    fee: any,
    organizer: any,
    price: any
) => {
    await ticketMarketplace
        .connect(buyer)
        .purchaseTicket(contractAddress, ticketId, uri, fee, organizer, {
            value: price,
        });
};

describe("TicketMarketplace", function () {
    const name = "Ticket";
    const symbol = "TK";
    const percentageFee = 1;
    const organizerFee = 5;
    const price1 = 2;
    const uri = "https://example.com/token/";
    let owner: any;
    let addr1: any;
    let addr2: any;
    let addrs: any;

    async function setup() {
        [owner, addr1, addr2, ...addrs] = await hre.ethers.getSigners();
        const event1 = {
            id: 1,
            name: "Tomorrowland",
            location: "Boom, Belgium",
            isCancelled: false,
            isCompleted: false,
            startTime: getUnixTimestamp(24),
            organizer: addr1.address,
            organizerFeePercentage: 5,
            totalAreas: 7,
        };
        const e1area1 = {
            id: 1,
            eventId: 1,
            name: "Floor A-P",
            price: toWei(price1),
            quota: 221,
            soldTickets: 0,
        };

        const ticketMarketplace = await hre.ethers.deployContract(
            "TicketMarketplace",
            [name, symbol, percentageFee]
        );

        return {
            ticketMarketplace, event1, e1area1,
        };
    }

    describe("Deployment", function () {
        it("Should set the right name, symbol and percentage fee", async function () {
            const { ticketMarketplace, event1, e1area1 } = await loadFixture(setup);
            expect(await ticketMarketplace.name()).to.equal(name);
            expect(await ticketMarketplace.symbol()).to.equal(symbol);
        });
    });

    describe("Buy ticket from organizer", function () {
        it("Should buy a ticket from organizer", async function () {
            const { ticketMarketplace, event1, e1area1 } = await loadFixture(setup);
            const totalPriceWei = toWei(price1);
            const organizerInitialBalance =
                await hre.ethers.provider.getBalance(addr1.address);
            const ownerInitialBalance = await hre.ethers.provider.getBalance(
                owner.address
            );
            const amountOwner = price1 * (percentageFee / 100);
            const amountOrganizer = price1 - amountOwner;

            await buyTicket(
                ticketMarketplace,
                addr2,
                event1,
                e1area1,
                uri,
                totalPriceWei
            );

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
            const { ticketMarketplace, event1, e1area1 } = await loadFixture(setup);
            const contractAddress = await ticketMarketplace.getAddress();
            const priceOffer = toWei(1.5);

            await buyTicket(
                ticketMarketplace,
                addr2,
                event1,
                e1area1,
                uri,
                toWei(price1)
            );

            await ticketMarketplace.connect(addr2).offerTicket(1, priceOffer);

            const ticket = await ticketMarketplace.tickets(1);
            expect(ticket.price).to.equal(priceOffer);
            expect(ticket.offered).to.equal(true);
            expect(await ticketMarketplace.getApproved(1)).to.equal(
                contractAddress
            );
        });
        it("Should not offer a ticket if it has already been offered", async function () {
            const { ticketMarketplace, event1, e1area1 } = await loadFixture(setup);
            const contractAddress = await ticketMarketplace.getAddress();
            const priceOffer = toWei(1.5);

            await buyTicket(
                ticketMarketplace,
                addr2,
                event1,
                e1area1,
                uri,
                toWei(price1)
            );

            await ticketMarketplace.connect(addr2).offerTicket(1, priceOffer);

            await expect(
                ticketMarketplace.connect(addr2).offerTicket(1, priceOffer)
            ).to.be.revertedWith("Ticket already offered");

            await purchaseTicket(
                ticketMarketplace,
                addrs[1],
                contractAddress,
                1,
                uri,
                event1.organizerFeePercentage,
                event1.organizer,
                priceOffer
            );

            await ticketMarketplace
                .connect(addrs[1])
                .offerTicket(1, priceOffer);

            const emittedEvent = await ticketMarketplace.queryFilter(
                ticketMarketplace.filters.Offered()
            );
            expect(emittedEvent.length).to.equal(2, "Event not emitted");
        });
    });

    describe("Buy ticket from reseller", function () {
        it("Should buy a ticket from reseller", async function () {
            const { ticketMarketplace, event1, e1area1 } = await loadFixture(setup);
            const contractAddress = await ticketMarketplace.getAddress();

            // Buy ticket from organizer
            const totalPriceWei = toWei(price1);
            const priceOffer = 2.5;
            const priceOfferWei = toWei(1.5);
            await buyTicket(
                ticketMarketplace,
                addrs[0],
                event1,
                e1area1,
                uri,
                totalPriceWei
            );

            const ownerInitialBalanceWei = await hre.ethers.provider.getBalance(
                owner.address
            );
            const ownerInitialBalance = Number(
                +fromWei(ownerInitialBalanceWei)
            );
            const organizerInitialBalance =
                await hre.ethers.provider.getBalance(addr1.address);
            const resellerInitialBalance = await hre.ethers.provider.getBalance(
                addrs[0].address
            );

            await ticketMarketplace
                .connect(addrs[0])
                .offerTicket(1, priceOfferWei);
            await purchaseTicket(
                ticketMarketplace,
                addrs[1],
                contractAddress,
                1,
                uri,
                event1.organizerFeePercentage,
                event1.organizer,
                priceOfferWei
            );

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
