import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    linea: {
      url: "" + process.env.TESTNET_KEY,
      accounts: ["" + process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      linea: "" + process.env.ETHERSCAN_API_KEY
    },
    customChains: [
      {
        network: "linea",
        chainId: 59140,
        urls: {
          apiURL: "https://goerli.lineascan.build/apis/",
          browserURL: "https://goerli.lineascan.build/"
        }
      }
    ]
  }
};

export default config;
