// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TicketMarketplace
 * @dev A contract for buying and selling tickets for events
 */
contract TicketMarketplace is ReentrancyGuard, ERC721URIStorage {
    struct Ticket {
        uint256 eventId;
        uint256 areaId;
        uint256 price;
        address payable owner;
        uint256 timesSold;
        bool offered;
        bool used;
    }

    mapping(uint256 => Ticket) public tickets;
    uint256 public nextTicketId = 1;
    uint256 private percentageFee;
    address payable contractOwner;

    event Offered(
        uint256 ticketId,
        uint256 indexed eventId,
        uint256 price,
        uint256 timestamp,
        address indexed seller
    );
    event Bought(
        uint256 ticketId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    constructor(string memory _name, string memory _symbol, uint256 _percentageFee) 
    ERC721(_name, _symbol) {
        contractOwner = payable(msg.sender);
        percentageFee = _percentageFee;
    }

    function _getFeeAmount(uint256 _price) internal view returns (uint256) {
        return (_price * percentageFee)/100;
    }

    function _getOrganizerFeeAmount(uint256 _price, uint256 _organizerFee)
        internal
        pure
        returns (uint256)
    {
        return (_price * _organizerFee)/100;
    }

    function _createTicket(
        uint256 _eventId,
        uint256 _areaId,
        uint256 _price,
        string memory _tokenURI,
        address _seller
    ) internal {
        _safeMint(msg.sender, nextTicketId);
        _setTokenURI(nextTicketId, _tokenURI);
        Ticket storage newTicket = tickets[nextTicketId];
        newTicket.eventId = _eventId;
        newTicket.areaId = _areaId;
        newTicket.price = _price;
        newTicket.owner = payable(msg.sender);
        newTicket.timesSold = 1;
        newTicket.used = false;
        newTicket.offered = false;
        emit Bought(
            nextTicketId, 
            _price, 
            _seller, 
            msg.sender
        );
        nextTicketId++;
    }

    function validatePurchase(
        uint256 _amount, 
        address _organizer,
        uint256 _quota,
        uint256 _startTime,
        uint256 _soldTickets,
        bool _isCancelled,
        bool _isCompleted 
    ) external view returns (bool) {
        if ((_amount <= 4) &&
        (msg.sender != _organizer) &&
        (_startTime > block.timestamp) &&
        (!_isCancelled) &&
        (!_isCompleted) &&
        (_quota > _soldTickets)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Buys a ticket for an event from the organizer. The buyer can't be the organizer
     * @param _amount Number of tickets to buy
     * @param _eventId ID of the event
     * @param _areaId ID of the area
     * @param _organizer Address of the organizer
     * @param _price Price of the ticket
     * @param _tokenURI URI of the ticket
     *
     * Emits a {Bought} event
     * Requirements:
        * - The buyer must send at least the price of the ticket
     */
    function buyTicketFromOrganizer(
        bool _isValid,
        uint256 _amount, 
        uint256 _eventId, 
        uint256 _areaId,
        address _organizer,
        uint256 _price,
        string memory _tokenURI
    )
        external
        payable
        nonReentrant
    {
        require(_isValid, "Invalid purchase");
        uint256 _totalPrice = _price * _amount;
        require(
            msg.value >= _totalPrice,
            "Insufficient payment"
        );

        for (uint256 i = 0; i < _amount; i++) {
            _createTicket(
                _eventId, 
                _areaId,
                _price,
                _tokenURI, 
                _organizer
            );
        }

        uint256 _feeAmount = _getFeeAmount(_totalPrice);
        uint256 _returnValue = msg.value - _totalPrice;
        payable(_organizer).transfer(_totalPrice - _feeAmount);
        contractOwner.transfer(_feeAmount);
        if (_returnValue > 0) {
            payable(msg.sender).transfer(_returnValue);
        }
    }

    /**
     * @dev Offers an owned ticket for sale
     * @param _ticketId ID of the ticket
     * @param _price Price of the ticket
     *
     * Emits a {Offered} event
     *
     * Requirements:
        * - The ticket must be owned by the caller
        * - The ticket must not be used
     */
    function offerTicket(uint256 _ticketId, uint256 _price)
        external
        nonReentrant
    {
        require(_ticketId > 0 && _ticketId <= nextTicketId);
        Ticket storage ticket = tickets[_ticketId];
        require(
            ownerOf(_ticketId) == msg.sender,
            "You don't own this NFT"
        );
        require(
            ticket.owner == msg.sender,
            "You dont have permission to sell this ticket"
        );
        require(!ticket.used, "Ticket is used");
        require(!ticket.offered, "Ticket already offered");
        approve(address(this), _ticketId);
        ticket.price = _price;
        ticket.offered = true;
        emit Offered(
            _ticketId, 
            ticket.eventId, 
            _price, 
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Buys a ticket for an event from another user
     * @param _nft Address of the NFT contract
     * @param _ticketId ID of the ticket
     *
     * Emits a {Bought} event
     *
     * Requirements:
        * - The ticket must be offered for sale
        * - The buyer must send at least the price of the ticket
        * - The ticket must not be used
     */
    function purchaseTicket(
        IERC721 _nft, 
        uint256 _ticketId, 
        string memory _tokenURI,
        uint256 _organizerFeePercentage,
        address _organizer
    )
        external
        payable
        nonReentrant
    {
        require(_ticketId > 0 && _ticketId <= nextTicketId);
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.timesSold > 0);
        require(msg.value >= ticket.price);
        require(!ticket.used, "Ticket is used");
        uint256 _feeAmountOwner = _getFeeAmount(ticket.price);
        uint256 _feeAmountOrganizer = _getOrganizerFeeAmount(
            ticket.price,
            _organizerFeePercentage
        );
        uint _returnValue = msg.value - ticket.price;
        address payable _seller = ticket.owner;
        _seller.transfer(ticket.price - _feeAmountOwner - _feeAmountOrganizer);
        payable(_organizer).transfer(_feeAmountOrganizer);
        contractOwner.transfer(_feeAmountOwner);
        if (_returnValue > 0) {
            payable(msg.sender).transfer(_returnValue);
        }
        _setTokenURI(_ticketId, _tokenURI);
        _nft.transferFrom(_seller, msg.sender, _ticketId);
        ticket.owner = payable(msg.sender);
        ticket.offered = false;
        ticket.timesSold++;
        emit Bought(
            _ticketId,
            ticket.price,
            _seller,
            msg.sender
        );
    }
}