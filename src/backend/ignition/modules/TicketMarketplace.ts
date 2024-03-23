import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { artifacts } from "hardhat";

const NAME = "Ticket";
const SYMBOL = "TK";
const PERCENTAGE_FEE = 1;

const saveFrontendFiles = (contract: any, name: string) => {
    const fs = require("fs");
    const contractsDir = __dirname + "/../../contractsData";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        `${contractsDir}/${name}-address.json`,
        JSON.stringify({ address: contract.address }, undefined, 2)
    );

    const contractArtifact = artifacts.readArtifactSync(name);

    fs.writeFileSync(
        `${contractsDir}/${name}.json`,
        JSON.stringify(contractArtifact, null, 2)
    );
}

const TicketMarketplaceModule = buildModule("TicketMarketplaceModule", (m) => {
    const TicketMarketplace = m.contract("TicketMarketplace", [
        NAME,
        SYMBOL,
        PERCENTAGE_FEE,
    ]);

    saveFrontendFiles(TicketMarketplace, "TicketMarketplace");

    return { TicketMarketplace };
});

export default TicketMarketplaceModule;
