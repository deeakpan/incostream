// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract IncostreamNFT is ERC721URIStorage {
    uint256 public nextTokenId;

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Incostream NFT", "INCFT") {}

    function mint(string memory tokenURI) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        nextTokenId++;
        emit Minted(msg.sender, tokenId, tokenURI);
        return tokenId;
    }
} 