// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TicketMarketplace
 * @dev A contract for buying and selling tickets for events
 */
contract TicketMarketplace is Ownable, ReentrancyGuard, ERC721URIStorage {
    struct Event {
        string name;
        // uint256 startTime;
        // uint256 endTime;
        address payable organizer;
        uint256 organizerFeePercentage;
        mapping(uint256 => Area) areas;
    }

    struct Area {
        string area;
        uint256 price;
        uint256 quota;
        uint256 soldTickets;
    }

    struct Ticket {
        uint256 eventId;
        uint256 areaId;
        uint256 price;
        address payable owner;
        uint256 timesSold;
        bool used;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    uint256 private nextEventId = 1;
    uint256 public nextTicketId = 1;
    uint256 public percentageFee; // Change to private

    event NewEvent(
        string indexed name,
        address indexed organizer,
        uint256 indexed eventId
    );
    event Offered(
        uint256 eventId,
        uint256 areaId,
        uint256 price,
        address indexed seller
    );
    event Bought(
        uint256 ticketId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    constructor(string memory _name, string memory _symbol, uint256 _percentageFee) 
    Ownable() ERC721(_name, _symbol) {
        percentageFee = _percentageFee;
    }


    function getArea(uint256 _eventId, uint256 _areaId)
        external
        view
        returns (Area memory)
    {
        return (events[_eventId].areas[_areaId]);
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

    /**
     * @dev Creates a new event. Only the owner can call this function
     * @param _name Name of the event
     * @param _organizer Address of the organizer
     * @param _organizerFeePercentage Percentage of the organizer fee
     * @param _areas Array of area names
     * @param _prices Array of prices for each area
     * @param _quotas Array of quotas for each area
     *
     * Emits a {NewEvent} event
     *
     * Requirements:
        * - `_areas` and `_prices` must have the same length
        * - `_areas` and `_quotas` must have the same length
        * - `_organizerFeePercentage` must be less than 100
     */
    function createEvent(
        string memory _name,
        // uint256 _startTime,
        // uint256 _endTime,
        address _organizer,
        uint256 _organizerFeePercentage,
        string[] memory _areas,
        uint256[] memory _prices,
        uint256[] memory _quotas
    ) external onlyOwner {
        require(
            _areas.length == _prices.length,
            "Area IDs and prices length mismatch"
        );
        require(
            _areas.length == _quotas.length, 
            "Quotas length mismatch"
        );
        require(
            _organizerFeePercentage < 100, 
            "Organizer fee can't be 100%"
        );

        Event storage newEvent = events[nextEventId];
        newEvent.name = _name;
        // newEvent.startTime = _startTime;
        // newEvent.endTime = _endTime;
        newEvent.organizer = payable(_organizer);
        newEvent.organizerFeePercentage = _organizerFeePercentage;

        for (uint256 i = 0; i < _areas.length; i++) {
            Area storage newArea = newEvent.areas[i + 1];
            newArea.area = _areas[i];
            newArea.price = _prices[i];
            newArea.quota = _quotas[i];
        }

        emit NewEvent(_name, _organizer, nextEventId);
        nextEventId++;
    }

    /**
     * @dev Buys a ticket for an event from the organizer. The buyer can't be the organizer
     * @param _eventId ID of the event
     * @param _areaId ID of the area
     *
     * Requirements:
        * - The buyer can't be the organizer
        * - The buyer must send at least the price of the ticket
        * - The area must have available tickets
     */
    function buyTicketFromOrganizer(uint256 _eventId, uint256 _areaId, string memory _tokenURI)
        external
        payable
        nonReentrant
    {
        Event storage _event = events[_eventId];
        require(msg.sender != _event.organizer, "Organizer can't buy");
        uint256 _price = _event.areas[_areaId].price;
        require(
            msg.value >= _price,
            "Insufficient payment"
        );
        require(
            _event.areas[_areaId].quota > _event.areas[_areaId].soldTickets,
            "Sold out"
        );

        _safeMint(msg.sender, nextTicketId);
        _setTokenURI(nextTicketId, _tokenURI);
        Ticket storage newTicket = tickets[nextTicketId];
        newTicket.eventId = _eventId;
        newTicket.areaId = _areaId;
        newTicket.price = _price;
        newTicket.owner = payable(msg.sender);
        newTicket.timesSold = 1;
        newTicket.used = false;
        _event.areas[_areaId].soldTickets++;
        nextTicketId++;

        uint256 _feeAmount = _getFeeAmount(_price);
        uint256 _returnValue = msg.value - _price;
        _event.organizer.transfer(_price - _feeAmount);
        payable(owner()).transfer(_feeAmount);
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
        approve(address(this), _ticketId);
        ticket.price = _price;
        emit Offered(ticket.eventId, ticket.areaId, _price, msg.sender);
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
    function purchaseTicket(IERC721 _nft, uint256 _ticketId)
        external
        payable
        nonReentrant
    {
        require(_ticketId > 0 && _ticketId <= nextTicketId);
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.timesSold > 0);
        require(msg.value >= ticket.price);
        require(!ticket.used, "Ticket is used");
        Event storage _event = events[ticket.eventId];
        uint256 _feeAmountOwner = _getFeeAmount(ticket.price);
        uint256 _feeAmountOrganizer = _getOrganizerFeeAmount(
            ticket.price,
            _event.organizerFeePercentage
        );
        uint _returnValue = msg.value - ticket.price;
        address payable _seller = ticket.owner;
        _seller.transfer(ticket.price - _feeAmountOwner - _feeAmountOrganizer);
        _event.organizer.transfer(_feeAmountOrganizer);
        payable(owner()).transfer(_feeAmountOwner);
        if (_returnValue > 0) {
            payable(msg.sender).transfer(_returnValue);
        }
        _nft.transferFrom(_seller, msg.sender, _ticketId);
        ticket.owner = payable(msg.sender);
        emit Bought(
            _ticketId,
            ticket.price,
            _seller,
            msg.sender
        );
    }
}