// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract TokenTransferer {
    function transferToken(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external {
        require(
            IERC20(tokenAddress).transferFrom(msg.sender, recipient, amount),
            "Failed to transfer tokens"
        );
    }

    function transferEth(address payable recipient) external payable {
        (bool success, ) = recipient.call{value: msg.value}("");
        require(success, "Failed to send ETH");
    }
}
