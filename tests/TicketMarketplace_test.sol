// SPDX-License-Identifier: GPL-3.0
        
pragma solidity >=0.4.22 <0.9.0;

// This import is automatically injected by Remix
import "remix_tests.sol"; 

// This import is required to use custom transaction context
// Although it may fail compilation in 'Solidity Compiler' plugin
// But it will work fine in 'Solidity Unit Testing' plugin
import "remix_accounts.sol";
import "../contracts/TicketMarketplace.sol";

// File name has to end with '_test.sol', this file can contain more than one testSuite contracts
contract testSuite {

    TicketMarketplace public test;
 
    /// 'beforeAll' runs before all other tests
    /// More special functions are: 'beforeEach', 'beforeAll', 'afterEach' & 'afterAll'
    function beforeAll() public {
        test = new TicketMarketplace(1);
    }

    /// Test for the success case of createEvent function
    function testCreateEventSuccess() public {
        string memory name = "Test Event";
        address organizer = address(0x123); // Example organizer address
        uint256 organizerFeePercentage = 10;
        string[] memory areas;
        areas[0] = "Area A";
        areas[1] = "Area B";
        uint256[] memory prices;
        prices[0] = 1;
        prices[1] = 2;
        uint256[] memory quotas;
        quotas[0] = 4;
        quotas[1] = 3;

        // Call createEvent function
        test.createEvent(
            name,
            organizer,
            organizerFeePercentage,
            areas,
            prices,
            quotas
        );

        // Verify the event creation
        (string memory eventName, , ) = test.events(1);

        Assert.equal(eventName, name, "Event name should match");
        // Assert.equal(test.events(1).organizer, organizer, "Organizer address should match");
        // Assert.equal(test.events(1).organizerFeePercentage, organizerFeePercentage, "Organizer fee percentage should match");

        // Verify the areas
        // for (uint256 i = 0; i < areas.length; i++) {
        //     TicketMarketplace.Area memory createdArea = createdEvent.areas[i + 1]; // Areas start from index 1
        //     Assert.equal(createdArea.area, areas[i], "Area name should match");
        //     Assert.equal(createdArea.price, prices[i], "Area price should match");
        //     Assert.equal(createdArea.quota, quotas[i], "Area quota should match");
        // }
    }
}
    