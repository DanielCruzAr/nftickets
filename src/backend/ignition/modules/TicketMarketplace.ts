import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NAME = "Ticket";
const SYMBOL = "TK";
const PERCENTAGE_FEE = 1;

const TicketMarketplaceModule = buildModule("TicketMarketplaceModule", (m) => {
    const TicketMarketplace = m.contract("TicketMarketplace", [
        NAME,
        SYMBOL,
        PERCENTAGE_FEE,
    ]);
    return { TicketMarketplace };
});

export default TicketMarketplaceModule;
