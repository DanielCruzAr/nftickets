// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTicket is ERC721, Ownable {
    uint256 public tokenCount;

    constructor() ERC721("Ticket", "TK") Ownable(msg.sender) {}

    function mint(address _buyer) external returns (uint256) {
        tokenCount++;
        _mint(_buyer, tokenCount);
        return tokenCount;
    }
}
