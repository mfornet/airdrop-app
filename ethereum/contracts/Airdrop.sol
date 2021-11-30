//SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract Airdrop is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    struct DropDetails {
        bool exist;
        address claimed;
        IERC20Upgradeable token;
        uint256 amount;
    }

    /// Mapping from the hash of each secret to the drop details
    mapping(address => DropDetails) links;

    /// Equivalent to constructor in upgradable contracts
    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
    }

    /// Required by UUPS Upgrade patter.
    /// Determines if current address is authorized to upgrade the contract.
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function createDrops(
        address[] memory publicKeys,
        uint256[] memory amounts,
        IERC20Upgradeable token
    ) public {
        uint256 count = publicKeys.length;
        require(count == amounts.length);
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < count; i++) {
            totalAmount += amounts[i];
            address pk = publicKeys[i];

            links[pk] = DropDetails({
                exist: true,
                claimed: address(0),
                token: token,
                amount: amounts[i]
            });
        }

        token.transferFrom(_msgSender(), address(this), totalAmount);
    }

    function linkStatus(address link) public view returns (DropDetails memory) {
        return links[link];
    }

    function recoverAddress(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (address) {
        bytes memory message = abi.encodePacked(
            "\x19Ethereum Signed Message:\n20",
            _msgSender()
        );

        bytes32 check = keccak256(message);
        return ecrecover(check, v, r, s);
    }

    /// To claim you should provide the signature of the message:
    /// msg = "\x19Ethereum Signed Message:\n20" + _msgSender()
    /// This must be signed using the secret key used to creat the airdrop to be claimed.
    function claim(
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        address pk = recoverAddress(v, r, s);
        DropDetails memory details = links[pk];

        require(details.exist, "Airdrop doesn't exist");
        require(details.claimed == address(0), "Airdrop was already claimed");

        details.claimed = _msgSender();
        links[pk] = details;

        details.token.transfer(_msgSender(), details.amount);
    }
}
