// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EventManagement is Ownable {
    struct Event {
        string name;
        string location;
        bool isCancelled;
        bool isCompleted;
        uint256 startTime;
        address payable organizer;
        uint256 organizerFeePercentage;
        uint256 totalAreas;
        mapping(uint256 => Area) areas;
    }

    struct Area {
        string area;
        uint256 price;
        uint256 quota;
        uint256 soldTickets;
    }

    mapping(uint256 => Event) public events;
    uint256 public nextEventId = 1;

    event NewEvent(
        string indexed name,
        address indexed organizer,
        uint256 indexed eventId
    );

    constructor() Ownable() {}

    function getArea(uint256 _eventId, uint256 _areaId)
        external
        view
        returns (Area memory)
    {
        return (events[_eventId].areas[_areaId]);
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
        uint256 _startTime,
        string memory _location,
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
        newEvent.location = _location;
        newEvent.startTime = _startTime;
        newEvent.organizer = payable(_organizer);
        newEvent.organizerFeePercentage = _organizerFeePercentage;
        newEvent.totalAreas = _areas.length;
        newEvent.isCancelled = false;
        newEvent.isCompleted = false;
        
        for (uint256 i = 0; i < _areas.length; i++) {
            Area storage newArea = newEvent.areas[i + 1];
            newArea.area = _areas[i];
            newArea.price = _prices[i];
            newArea.quota = _quotas[i];
        }

        emit NewEvent(_name, _organizer, nextEventId);
        nextEventId++;
    }
}