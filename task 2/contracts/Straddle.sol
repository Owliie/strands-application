// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {LyraAdapter} from "@lyrafinance/protocol/contracts/periphery/LyraAdapter.sol";

contract Straddle is LyraAdapter {
    constructor() LyraAdapter() {}

    function init(
        address _lyraRegistry,
        address _optionMarket,
        address _curveSwap,
        address _feeCounter
    ) external onlyOwner {
        setLyraAddresses(_lyraRegistry, _optionMarket, _curveSwap, _feeCounter);
    }

    function buyStraddle(
        uint256 size,
        uint256 strikeId
    ) external returns (uint256, uint256) {
        uint256 balance = quoteAsset.balanceOf(address(this));

        quoteAsset.transferFrom(
            msg.sender,
            address(this),
            quoteAsset.balanceOf(msg.sender)
        );

        quoteAsset.approve(address(optionMarket), type(uint).max);

        TradeInputParameters memory params = TradeInputParameters(
            strikeId, // strikeId
            0, // positionId
            1, // iterations
            OptionType.LONG_CALL, // type
            size, // amount
            0, // setCollateralTo
            0, // minCost
            type(uint).max, // maxCost
            address(0) // rewardRecipient
        );

        TradeResult memory callResult = _openPosition(params);

        params.optionType = OptionType.LONG_PUT;

        TradeResult memory putResult = _openPosition(params);

        quoteAsset.transfer(
            msg.sender,
            quoteAsset.balanceOf(address(this)) - balance
        );

        return (callResult.positionId, putResult.positionId);
    }
}
