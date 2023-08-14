// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {LyraAdapter} from "@lyrafinance/protocol/contracts/periphery/LyraAdapter.sol";
import "./interfaces/IStraddle.sol";

contract Straddle is LyraAdapter, IStraddle {
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
        uint256 strikeId,
        uint256 maxCost
    ) external returns (uint256, uint256, uint256) {
        quoteAsset.transferFrom(msg.sender, address(this), maxCost);
        quoteAsset.approve(address(optionMarket), maxCost);

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

        // used for calculating the cost of the straddle
        uint256 totalCost = callResult.totalCost + putResult.totalCost;

        quoteAsset.transfer(msg.sender, maxCost - totalCost);

        return (callResult.positionId, putResult.positionId, totalCost);
    }
}
