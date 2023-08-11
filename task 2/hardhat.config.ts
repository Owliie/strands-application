import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import 'hardhat-dependency-compiler'
import { lyraContractPaths } from '@lyrafinance/protocol/dist/test/utils/package/index-paths'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        runs: 200,
        enabled: true
      }
    }
  },
  dependencyCompiler: {
    paths: lyraContractPaths
  }
};

export default config;
