import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.5",
  paths: {
    sources: "./src/backend/contracts",
    tests: "./src/backend/test",
    cache: "./src/backend/cache",
    artifacts: "./src/backend/artifacts",
    ignition: "./src/backend/ignition",
  },
  defaultNetwork: "ganache",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545"
    },
    hardhat: {},
  },
};

export default config;
