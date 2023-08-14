// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IStraddle {
    function init(
        address _lyraRegistry,
        address _optionMarket,
        address _curveSwap,
        address _feeCounter
    ) external;

    function buyStraddle(
        uint256 size,
        uint256 strikeId,
        uint256 maxCost
    )
        external
        returns (
            uint256 callPoisitonId,
            uint256 putPositionId,
            uint256 totalCost
        );
}
