// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ITokenTransferer {
    function transferToken(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external;

    function transferEth(address payable recipient) external payable;
}
