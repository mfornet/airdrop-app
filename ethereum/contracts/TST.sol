//SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";

contract TST is ERC20PresetFixedSupply {
    constructor()
        ERC20PresetFixedSupply("TST", "Test Token", 1000000000, _msgSender())
    {}

    function decimals() public pure override returns (uint8) {
        return 0;
    }
}
