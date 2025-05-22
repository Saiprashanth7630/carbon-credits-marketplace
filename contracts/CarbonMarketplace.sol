// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 amount;
        uint256 price;
        bool isActive;
    }

    struct BuyRequest {
        address buyer;
        uint256 amount;
        uint256 maxPrice;
        bool isActive;
    }

    IERC20 public carbonToken;
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => BuyRequest) public buyRequests;
    uint256 public listingCount;
    uint256 public buyRequestCount;

    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 price);
    event ListingFilled(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 price);
    event BuyRequestCreated(uint256 indexed requestId, address indexed buyer, uint256 amount, uint256 maxPrice);
    event BuyRequestFilled(uint256 indexed requestId, address indexed seller, uint256 amount, uint256 price);

    constructor(address _carbonToken) {
        carbonToken = IERC20(_carbonToken);
    }

    function createListing(uint256 _amount, uint256 _price) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_price > 0, "Price must be greater than 0");
        require(carbonToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        uint256 listingId = listingCount++;
        listings[listingId] = Listing({
            seller: msg.sender,
            amount: _amount,
            price: _price,
            isActive: true
        });

        emit ListingCreated(listingId, msg.sender, _amount, _price);
    }

    function fillListing(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;
        carbonToken.transfer(msg.sender, listing.amount);
        payable(listing.seller).transfer(listing.price);

        emit ListingFilled(_listingId, msg.sender, listing.amount, listing.price);
    }

    function createBuyRequest(uint256 _amount, uint256 _maxPrice) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_maxPrice > 0, "Max price must be greater than 0");

        uint256 requestId = buyRequestCount++;
        buyRequests[requestId] = BuyRequest({
            buyer: msg.sender,
            amount: _amount,
            maxPrice: _maxPrice,
            isActive: true
        });

        emit BuyRequestCreated(requestId, msg.sender, _amount, _maxPrice);
    }

    function fillBuyRequest(uint256 _requestId) external nonReentrant {
        BuyRequest storage request = buyRequests[_requestId];
        require(request.isActive, "Request is not active");
        
        request.isActive = false;
        require(carbonToken.transferFrom(msg.sender, request.buyer, request.amount), "Transfer failed");
        payable(msg.sender).transfer(request.maxPrice);

        emit BuyRequestFilled(_requestId, msg.sender, request.amount, request.maxPrice);
    }

    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(msg.sender == listing.seller, "Not the seller");
        require(listing.isActive, "Listing is not active");

        listing.isActive = false;
        carbonToken.transfer(msg.sender, listing.amount);
    }

    function cancelBuyRequest(uint256 _requestId) external nonReentrant {
        BuyRequest storage request = buyRequests[_requestId];
        require(msg.sender == request.buyer, "Not the buyer");
        require(request.isActive, "Request is not active");

        request.isActive = false;
    }
} 