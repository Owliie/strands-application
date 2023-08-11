// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {LyraAdapter} from "@lyrafinance/protocol/contracts/periphery/LyraAdapter.sol";

// import {IERC20Decimals} from "@lyrafinance/protocol/contracts/interfaces/IERC20Decimals.sol";

contract Straddle is LyraAdapter {
    constructor() LyraAdapter() {}

    function initAdapter(
        address _lyraRegistry,
        address _optionMarket,
        address _curveSwap,
        address _feeCounter
    ) external onlyOwner {
        // set addresses for LyraAdapter
        setLyraAddresses(_lyraRegistry, _optionMarket, _curveSwap, _feeCounter);
    }

    function buyStraddle(uint size, uint strikeId) external {
        baseAsset.transferFrom(msg.sender, address(this), size);

        // TODO check
        TradeInputParameters memory params = TradeInputParameters(
            strikeId,
            0,
            1,
            OptionType.LONG_CALL,
            size,
            0,
            0,
            type(uint).max,
            msg.sender
        );

        _openPosition(params);

        params.optionType = OptionType.LONG_PUT;

        _openPosition(params);
    }
}
