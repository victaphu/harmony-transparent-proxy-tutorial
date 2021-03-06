pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Box is Initializable{
    uint256 public x;

    function initialize(uint256 _x) public initializer {
        x = _x;
    }
}