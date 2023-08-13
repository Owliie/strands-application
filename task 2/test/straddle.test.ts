import { ethers } from "hardhat";
import { expect } from "chai";
import { TestSystem, lyraEvm, lyraConstants, lyraUtils, TestSystemContractsType } from '@lyrafinance/protocol'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Straddle } from "../typechain-types";
import { getEvents } from "../utils/eventsHandler";

let signer: SignerWithAddress;

describe('Straddle', () => {
    let testSystem: TestSystemContractsType
    let straddle: Straddle

    beforeEach(async () => {
        const signers = await ethers.getSigners()
        signer = signers[0]

        testSystem = await TestSystem.deploy(signer);
        await TestSystem.seed(signer, testSystem);

        const Straddle = await ethers.getContractFactory("Straddle");
        straddle = await Straddle.deploy();
        await straddle.deployed();

        await straddle.init(
            testSystem.lyraRegistry.address,
            testSystem.optionMarket.address,
            testSystem.testCurve.address,
            testSystem.basicFeeCounter.address,
        )
    })

    it('Should buy call and put and price rises', async () => {
        const boardIds = await testSystem.optionMarket.getLiveBoards();
        const strikeIds = await testSystem.optionMarket.getBoardStrikes(boardIds[0]);

        const strike = await testSystem.optionMarket.getStrike(strikeIds[0]);
        expect(strike.strikePrice).eq(lyraUtils.toBN('1500'));

        const userBalanceBefore = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        const straddleBalanceBefore = await testSystem.snx.quoteAsset.balanceOf(straddle.address);

        const amount = lyraUtils.toBN('1');
        await testSystem.snx.quoteAsset.approve(straddle.address, testSystem.snx.quoteAsset.balanceOf(signer.address));

        const tx = await straddle.buyStraddle(amount, strike.id)
        const receipt = await tx.wait()

        const userBalanceAfter = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        const straddleBalanceAfter = await testSystem.snx.quoteAsset.balanceOf(straddle.address);

        const events = await getEvents(
            ethers.provider,
            testSystem.optionMarket,
            {
                Trade: ['trade']
            },
            receipt.blockNumber,
            receipt.blockNumber
        );

        const callEventTotalCost = events[0]['Trade'].trade[9]
        const putEventTotalCost = events[1]['Trade'].trade[9]

        expect(userBalanceBefore.sub(userBalanceAfter)).to.be.equal(callEventTotalCost.add(putEventTotalCost))
        expect(straddleBalanceBefore).to.be.equal(straddleBalanceAfter)
        expect(straddleBalanceBefore).to.be.equal(0)

        await lyraEvm.fastForward(lyraConstants.MONTH_SEC);
        await testSystem.snx.exchangeRates.setRateAndInvalid(lyraUtils.toBytes32('sETH'), lyraUtils.toBN('2300'), false);

        await testSystem.optionMarket.settleExpiredBoard(boardIds[0]);
        expect(await testSystem.liquidityPool.totalOutstandingSettlements()).to.be.equal(lyraUtils.toBN('800'));

        const preBalance = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        await testSystem.shortCollateral.settleOptions([strikeIds[0]]);
        const postBalance = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        expect(postBalance.sub(preBalance)).to.be.equal(0);
    });

    it('Should buy call and put and price dumps', async () => {
        const boardIds = await testSystem.optionMarket.getLiveBoards();
        const strikeIds = await testSystem.optionMarket.getBoardStrikes(boardIds[0]);

        const strike = await testSystem.optionMarket.getStrike(strikeIds[0]);
        expect(strike.strikePrice).eq(lyraUtils.toBN('1500'));

        const userBalanceBefore = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        const straddleBalanceBefore = await testSystem.snx.quoteAsset.balanceOf(straddle.address);

        const amount = lyraUtils.toBN('1');
        await testSystem.snx.quoteAsset.approve(straddle.address, testSystem.snx.quoteAsset.balanceOf(signer.address));

        const tx = await straddle.buyStraddle(amount, strike.id)
        const receipt = await tx.wait()

        const userBalanceAfter = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        const straddleBalanceAfter = await testSystem.snx.quoteAsset.balanceOf(straddle.address);

        const events = await getEvents(
            ethers.provider,
            testSystem.optionMarket,
            {
                Trade: ['trade']
            },
            receipt.blockNumber,
            receipt.blockNumber
        );

        const callEventTotalCost = events[0]['Trade'].trade[9]
        const putEventTotalCost = events[1]['Trade'].trade[9]

        expect(userBalanceBefore.sub(userBalanceAfter)).to.be.equal(callEventTotalCost.add(putEventTotalCost))
        expect(straddleBalanceBefore).to.be.equal(straddleBalanceAfter)
        expect(straddleBalanceBefore).to.be.equal(0)

        await lyraEvm.fastForward(lyraConstants.MONTH_SEC);
        await testSystem.snx.exchangeRates.setRateAndInvalid(lyraUtils.toBytes32('sETH'), lyraUtils.toBN('1200'), false);

        await testSystem.optionMarket.settleExpiredBoard(boardIds[0]);
        expect(await testSystem.liquidityPool.totalOutstandingSettlements()).to.be.equal(lyraUtils.toBN('300'));

        const preBalance = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        await testSystem.shortCollateral.settleOptions([strikeIds[0]]);
        const postBalance = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        expect(postBalance.sub(preBalance)).to.be.equal(0);
    });
}); 
