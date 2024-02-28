// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFTicket.sol";

contract TicketMarketplace is Ownable {
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
        mapping(uint256 => Ticket) tickets;
        uint256 buyedTickets;
    }

    struct Ticket {
        uint256 tokenId;
        uint256 price;
        address payable owner;
        uint256 timesSold;
    }

    mapping(uint256 => Event) public events;
    uint256 private nextEventId = 1;
    uint256 public nextTicketId = 1;
    uint256 private percentageFee;
    bool private _isReentrant;

    NFTicket public nftContract;

    constructor(uint256 _percentageFee) Ownable(msg.sender) {
        percentageFee = _percentageFee;
        nftContract = new NFTicket();
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

        Event storage newEvent = events[nextEventId];
        newEvent.name = _name;
        // newEvent.startTime = _startTime;
        // newEvent.endTime = _endTime;
        newEvent.organizer = payable(_organizer);
        newEvent.organizerFeePercentage = _organizerFeePercentage;

        for (uint256 i = 0; i < _areas.length; i++) {
            Area storage newSeat = newEvent.areas[i + 1];
            newSeat.area = _areas[i];
            newSeat.price = _prices[i];
            newSeat.quota = _quotas[i];
        }

        nextEventId++;
    }

    function _getFeeAmount(uint256 _price)
        internal
        view
        returns (uint256)
    {
        return _price - ((_price * (100 - percentageFee)) / 100);
    }

    function buyTicketFromOrganizer(uint256 _eventId, uint256 _areaId)
        external
        payable
    {
        Event storage _event = events[_eventId];
        require(msg.sender != _event.organizer, "Organizer can't buy");
        require(
            msg.value >= _event.areas[_areaId].price,
            "Insufficient payment"
        );
        require(
            _event.areas[_areaId].quota > _event.areas[_areaId].buyedTickets,
            "Area full"
        );
        require(!_isReentrant, "Reentrancy guard");

        _isReentrant = true;
        uint256 _tokenId = nftContract.mint(msg.sender);
        Ticket storage newTicket = _event.areas[_areaId].tickets[nextTicketId];
        newTicket.tokenId = _tokenId;
        newTicket.price = _event.areas[_areaId].price;
        newTicket.owner = payable(msg.sender);
        newTicket.timesSold = 1;
        _event.areas[_areaId].buyedTickets++;
        nextTicketId++;
        uint _price = _event.areas[_areaId].price;
        uint _feeAmount = _getFeeAmount(_price);
        _event.organizer.transfer(_price - _feeAmount);
        address payable ownerPayable = payable(owner());
        ownerPayable.transfer(_feeAmount);
        _isReentrant = false;
    }
}
