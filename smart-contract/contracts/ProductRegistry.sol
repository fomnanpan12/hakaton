// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ProductRegistry {
    struct Product {
        uint256 id;
        string name;
        string producerAddress;
        string harvestDate;
        string packagingDate;
        string expiryDate;
        address owner;
        uint256 timestamp;
    }

    uint256 public productCount;
    mapping(uint256 => Product) public products;

    event ProductRegistered(
        uint256 id,
        string name,
        string producerAddress,
        string harvestDate,
        string packagingDate,
        string expiryDate,
        address indexed owner
    );

    function registerProduct(
        string memory _name,
        string memory _producerAddress,
        string memory _harvestDate,
        string memory _packagingDate,
        string memory _expiryDate
    ) public {
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _producerAddress,
            _harvestDate,
            _packagingDate,
            _expiryDate,
            msg.sender,
            block.timestamp
        );

        emit ProductRegistered(
            productCount,
            _name,
            _producerAddress,
            _harvestDate,
            _packagingDate,
            _expiryDate,
            msg.sender
        );
    }

    function getProduct(uint256 _id)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            address,
            uint256
        )
    {
        Product memory p = products[_id];
        return (
            p.id,
            p.name,
            p.producerAddress,
            p.harvestDate,
            p.packagingDate,
            p.expiryDate,
            p.owner,
            p.timestamp
        );
    }
}
