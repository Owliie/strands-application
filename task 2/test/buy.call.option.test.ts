import { ethers } from "hardhat";
import { expect } from "chai";
import { TestSystem, lyraEvm, lyraConstants, lyraUtils, TestSystemContractsType } from '@lyrafinance/protocol'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let signer: SignerWithAddress;

describe('Lyra test system', () => {
    let testSystem: TestSystemContractsType

    beforeEach(async () => {
        const signers = await ethers.getSigners()
        signer = signers[0]

        testSystem = await TestSystem.deploy(signer);
        await TestSystem.seed(signer, testSystem);
    })

    it('Should buy long call', async () => {
        const boardIds = await testSystem.optionMarket.getLiveBoards();
        const strikeIds = await testSystem.optionMarket.getBoardStrikes(boardIds[0]);

        const strike = await testSystem.optionMarket.getStrike(strikeIds[0]);
        expect(strike.strikePrice).eq(lyraUtils.toBN('1500'));

        await testSystem.optionMarket.openPosition({
            strikeId: strikeIds[0],
            positionId: 0,
            amount: lyraUtils.toBN('1'),
            setCollateralTo: 0,
            iterations: 1,
            minTotalCost: 0,
            maxTotalCost: lyraConstants.MAX_UINT,
            optionType: TestSystem.OptionType.LONG_CALL,
        });

        await lyraEvm.fastForward(lyraConstants.MONTH_SEC);
        await testSystem.snx.exchangeRates.setRateAndInvalid(lyraUtils.toBytes32('sETH'), lyraUtils.toBN('2300'), false);

        await testSystem.optionMarket.settleExpiredBoard(boardIds[0]);
        expect(await testSystem.liquidityPool.totalOutstandingSettlements()).to.be.equal(lyraUtils.toBN('800'));

        const preBalance = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        await testSystem.shortCollateral.settleOptions([strikeIds[0]]);
        const postBalance = await testSystem.snx.quoteAsset.balanceOf(signer.address);
        expect(postBalance.sub(preBalance)).to.be.equal(lyraUtils.toBN('800'));
    });
}); 
