//SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract TrustedAirdrop is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    struct DropDetails {
        bool exist;
        address claimed;
        IERC20Upgradeable token;
        uint256 amount;
    }

    /// Mapping from the hash of each secret to the drop details
    mapping(bytes32 => DropDetails) links;

    /// Equivalent to constructor in upgradable contracts
    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
    }

    /// Required by UUPS Upgrade pattern.
    /// Determines if current address is authorized to upgrade the contract.
    function _authorizeUpgrade(address) internal override onlyOwner {}

    function createDrops(
        uint256 amount,
        bytes32[] memory ids,
        IERC20Upgradeable token
    ) public onlyOwner {
        uint256 count = ids.length;
        token.transferFrom(_msgSender(), address(this), count * amount);

        for (uint256 i = 0; i < count; i++) {
            links[ids[i]] = DropDetails({
                exist: true,
                claimed: address(0),
                token: token,
                amount: amount
            });
        }
    }

    function claim(bytes32 id, address receipient) public onlyOwner {
        DropDetails memory details = links[id];

        require(details.exist, "Drop doesn't exist");
        require(details.claimed == address(0), "Linkdrop was already used");

        details.claimed = receipient;
        links[id] = details;

        details.token.transfer(receipient, details.amount);
    }
}
