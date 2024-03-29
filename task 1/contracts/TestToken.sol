// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(uint256 supply) ERC20("TestToken", "TST") {
        _mint(msg.sender, supply * 10 ** decimals());
    }
}
