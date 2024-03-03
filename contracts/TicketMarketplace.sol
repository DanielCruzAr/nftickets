// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts@4.5.0/security/ReentrancyGuard.sol";

contract TicketMarketplace is Ownable, ReentrancyGuard, ERC721 {
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
        uint256 buyedTickets;
    }

    struct Ticket {
        uint256 eventId;
        uint256 areaId;
        uint256 price;
        address payable owner;
        uint256 timesSold;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    uint256 private nextEventId = 1;
    uint256 public nextTicketId = 1;
    uint256 public percentageFee; // Change to private

    // event NewEvent(string name);
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

    constructor(uint256 _percentageFee) Ownable(msg.sender) ERC721("Ticket", "TK") {
        percentageFee = _percentageFee;
        /// @dev Test event and Area
        Event storage testEvent = events[nextEventId];
        testEvent.name = "Test Event";
        testEvent.organizer = payable(msg.sender);
        testEvent.organizerFeePercentage = 10;
        Area storage newArea = testEvent.areas[1];
        newArea.area = "General";
        newArea.price = 10000000000000000000;
        newArea.quota = 10;
        nextEventId++;
        /// end test
    }

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
        require(_areas.length == _quotas.length);
        require(_organizerFeePercentage < 100);

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

        nextEventId++;
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

    function buyTicketFromOrganizer(uint256 _eventId, uint256 _areaId)
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
            _event.areas[_areaId].quota > _event.areas[_areaId].buyedTickets,
            "Area full"
        );

        _mint(msg.sender, nextTicketId);
        Ticket storage newTicket = tickets[nextTicketId];
        newTicket.eventId = _eventId;
        newTicket.areaId = _areaId;
        newTicket.price = _price;
        newTicket.owner = payable(msg.sender);
        newTicket.timesSold = 1;
        _event.areas[_areaId].buyedTickets++;
        nextTicketId++;

        uint256 _feeAmount = _getFeeAmount(_price);
        uint256 _returnValue = msg.value - _price;
        _event.organizer.transfer(_price - _feeAmount);
        payable(owner()).transfer(_feeAmount);
        if (_returnValue > 0) {
            payable(msg.sender).transfer(_returnValue);
        }
    }

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
        approve(address(this), _ticketId);
        ticket.price = _price;
        emit Offered(ticket.eventId, ticket.areaId, _price, msg.sender);
    }

    function purchaseTicket(IERC721 _nft, uint256 _ticketId)
        external
        payable
        nonReentrant
    {
        require(_ticketId > 0 && _ticketId <= nextTicketId);
        Ticket storage ticket = tickets[_ticketId];
        require(ticket.timesSold > 0);
        require(msg.value >= ticket.price);
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
