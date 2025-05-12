// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditsMarketplace is ERC20, Ownable {
    uint256 public pricePerCarbonCredit; // Price per carbon credit in the base token
    mapping(address => uint256) public carbonCredits; // Mapping to track the carbon credits for each user

    // Event for carbon credit purchase
    event CarbonCreditPurchased(address indexed buyer, uint256 amount);
    // Event for carbon credit transfer
    event CarbonCreditTransferred(address indexed from, address indexed to, uint256 amount);
    // Event for price change
    event PriceUpdated(uint256 newPrice);

    constructor(uint256 initialSupply, uint256 _pricePerCarbonCredit)
        ERC20("CarbonCreditToken", "CCT")
        Ownable(msg.sender)
    {
        _mint(msg.sender, initialSupply); // Mint initial tokens to the contract creator
        pricePerCarbonCredit = _pricePerCarbonCredit;
    }

    // Function to purchase carbon credits
    function purchaseCarbonCredits(uint256 amount) external payable {
        uint256 totalPrice = amount * pricePerCarbonCredit;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Mint new carbon credits for the buyer
        carbonCredits[msg.sender] += amount;
        
        // Emit purchase event
        emit CarbonCreditPurchased(msg.sender, amount);
    }

    // Function to transfer carbon credits to another user
    function transferCarbonCredits(address recipient, uint256 amount) external {
        require(carbonCredits[msg.sender] >= amount, "Insufficient carbon credits");
        carbonCredits[msg.sender] -= amount;
        carbonCredits[recipient] += amount;
        
        // Emit transfer event
        emit CarbonCreditTransferred(msg.sender, recipient, amount);
    }

    // Function for the owner to update the price per carbon credit
    function updatePrice(uint256 newPrice) external onlyOwner {
        pricePerCarbonCredit = newPrice;

        // Emit price update event
        emit PriceUpdated(newPrice);
    }

    // Function to withdraw ETH from the contract (owner only)
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
