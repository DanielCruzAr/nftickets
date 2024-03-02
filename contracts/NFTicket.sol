// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTicket is ERC721 {
    uint256 public tokenCount;

    constructor() ERC721("Ticket", "TK") {}

    function mint(address _buyer) external returns (uint256) {
        tokenCount++;
        _mint(_buyer, tokenCount);
        return tokenCount;
    }
}
