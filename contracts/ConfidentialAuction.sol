// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IConfidentialToken {
    function transferFrom(address from, address to, bytes calldata encryptedAmount) external returns (bool);
}

interface IERC721 {
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

contract ConfidentialAuction is IERC721Receiver {
    struct Auction {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 endTime;
        string metadataURI;
        uint256 minBid;
        address highestBidder;
        bytes highestBid;
        bool settled;
    }

    IConfidentialToken public cUSDC;
    uint256 public auctionCount;
    mapping(uint256 => Auction) public auctions;
    
    // Track NFTs that are in escrow but not in active auctions
    mapping(address => mapping(uint256 => address)) public nftEscrow; // nftContract => tokenId => owner

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, address nft, uint256 tokenId, uint256 endTime, string metadataURI, uint256 minBid);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, bytes encryptedBid);
    event AuctionSettled(uint256 indexed auctionId, address winner);
    event NFTRecovered(address indexed owner, address nftContract, uint256 tokenId);

    constructor(address _cUSDC) {
        cUSDC = IConfidentialToken(_cUSDC);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        // Record that this NFT is in escrow
        nftEscrow[msg.sender][tokenId] = from;
        return this.onERC721Received.selector;
    }

    function createAuction(
        address nftAddress, 
        uint256 tokenId, 
        uint256 endTime,
        string memory metadataURI,
        uint256 minBid
    ) external returns (uint256) {
        require(endTime > block.timestamp, "End time must be in the future");
        require(minBid > 0, "Minimum bid must be greater than 0");
        
        // Transfer NFT to this contract (will trigger onERC721Received)
        IERC721(nftAddress).safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Remove from escrow if it exists (from previous failed attempts)
        delete nftEscrow[nftAddress][tokenId];
        
        auctions[auctionCount] = Auction({
            seller: msg.sender,
            nftAddress: nftAddress,
            tokenId: tokenId,
            endTime: endTime,
            metadataURI: metadataURI,
            minBid: minBid,
            highestBidder: address(0),
            highestBid: "",
            settled: false
        });
        emit AuctionCreated(auctionCount, msg.sender, nftAddress, tokenId, endTime, metadataURI, minBid);
        return auctionCount++;
    }

    function recoverNFT(address nftAddress, uint256 tokenId) external {
        require(nftEscrow[nftAddress][tokenId] == msg.sender, "Not owner of NFT in escrow");
        delete nftEscrow[nftAddress][tokenId];
        IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenId);
        emit NFTRecovered(msg.sender, nftAddress, tokenId);
    }

    function bid(uint256 auctionId, bytes calldata encryptedBid) external {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp < auction.endTime, "Auction ended");
        require(!auction.settled, "Auction settled");
        
        // FHE comparison: require(FHE.gt(encryptedBid, auction.highestBid), "Bid not high enough");
        // FHE comparison: require(FHE.gte(encryptedBid, auction.minBid), "Bid below minimum");
        
        cUSDC.transferFrom(msg.sender, address(this), encryptedBid);
        auction.highestBidder = msg.sender;
        auction.highestBid = encryptedBid;
        emit BidPlaced(auctionId, msg.sender, encryptedBid);
    }

    function settleAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.settled, "Already settled");
        auction.settled = true;
        IERC721(auction.nftAddress).safeTransferFrom(address(this), auction.highestBidder, auction.tokenId);
        cUSDC.transferFrom(address(this), auction.seller, auction.highestBid);
        emit AuctionSettled(auctionId, auction.highestBidder);
    }
} 