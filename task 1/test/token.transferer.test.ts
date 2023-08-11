import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, run } from "hardhat";
import { expect } from "chai";

describe.only("TokenTransferer", function () {
    const initialSupply = ethers.parseEther("100");

    async function deploySetupFixture() {
        const [deployer, addr1, addr2] = await ethers.getSigners();

        const Erc20Token = await ethers.getContractFactory("TestToken");
        const erc20Token = await Erc20Token.deploy(Number(ethers.formatEther(initialSupply)).toFixed(0));
        const tokenTransferer = await ethers.deployContract("TokenTransferer");

        // Fixtures can return anything you consider useful for your tests
        return { erc20Token, tokenTransferer, deployer, addr1, addr2 };
    }

    before(async function () {
        await run("compile");
    });

    it("Should transfer tokens", async function () {
        const { erc20Token, tokenTransferer, deployer, addr1, addr2 } = await loadFixture(deploySetupFixture);

        expect(await erc20Token.balanceOf(addr2.address)).to.equal(0);
        expect(await erc20Token.balanceOf(addr1.address)).to.equal(0);
        expect(await erc20Token.balanceOf(deployer.address)).to.equal(initialSupply);

        const amount = ethers.parseEther("1");

        await erc20Token.connect(deployer).transfer(addr1.address, amount);

        expect(await erc20Token.balanceOf(addr1.address)).to.equal(amount);
        expect(await erc20Token.balanceOf(deployer.address)).to.equal(initialSupply - amount);

        await erc20Token.connect(addr1).approve(await tokenTransferer.getAddress(), amount);
        await tokenTransferer.connect(addr1).transferToken(await erc20Token.getAddress(), addr2.address, amount);

        expect(await erc20Token.balanceOf(addr1.address)).to.equal(0);
        expect(await erc20Token.balanceOf(addr2.address)).to.equal(amount);
    })

    it("Should transfer ETH", async function () {
        const { tokenTransferer, addr1, addr2 } = await loadFixture(deploySetupFixture);

        const amount = ethers.parseEther("1");

        const balanceBeforeAddr1 = await ethers.provider.getBalance(addr1.address);
        const balanceBeforeAddr2 = await ethers.provider.getBalance(addr2.address);

        await tokenTransferer.connect(addr1).transferEth(addr2.address, { value: amount });

        expect(await ethers.provider.getBalance(addr1.address)).to.be.lte(balanceBeforeAddr1 - amount);
        expect(await ethers.provider.getBalance(addr2.address)).to.equal(balanceBeforeAddr2 + amount);
    })

    it('Should revert if not enough tokens', async function () {
        const { erc20Token, tokenTransferer, addr1, addr2 } = await loadFixture(deploySetupFixture);

        const amount = ethers.parseEther("1");

        await expect(tokenTransferer.connect(addr1).transferToken(await erc20Token.getAddress(), addr2.address, amount))
            .to.be.revertedWith("ERC20: insufficient allowance");
    })

    it('Should revert if not enough ETH', async function () {
        const { erc20Token, tokenTransferer, addr1 } = await loadFixture(deploySetupFixture);

        const amount = ethers.parseEther("1");

        await expect(tokenTransferer.connect(addr1).transferEth(await erc20Token.getAddress(), { value: amount }))
            .to.be.revertedWith("Failed to send ETH");
    })
});
