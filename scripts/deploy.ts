import { ethers } from "hardhat";

async function main() {
  const signer = (await ethers.getSigners())[0];
  console.log(`Deploying contracts with the account: ${signer.address}`);
  console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(signer.address))}`);
  const tokenTransferer = await ethers.deployContract("TokenTransferer");

  await tokenTransferer.waitForDeployment();

  console.log(
    `TokenTransferer deployed at: ${await tokenTransferer.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
