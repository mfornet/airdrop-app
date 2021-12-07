import { ethers } from "ethers";
import { Airdrop, TST } from "./typechain-types";
export declare const ADDRESS = "0x1CF5b0289F097Aff132F368FAc63aE5AfC6F17E8";
export declare const erc20: (address: string, provider: ethers.Signer | ethers.providers.BaseProvider) => TST;
export type { Airdrop, TST };
declare const _default: {
    contract: (provider: ethers.Signer | ethers.providers.BaseProvider) => Airdrop;
};
export default _default;
