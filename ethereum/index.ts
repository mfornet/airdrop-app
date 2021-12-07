import { ethers } from "ethers";
import * as AirdropCompiled from "./artifacts/contracts/Airdrop.sol/Airdrop.json";
import * as TSTCompiled from "./artifacts/contracts/TST.sol/TST.json";
import { Airdrop, TST } from "./typechain-types";

export const ADDRESS = "0x1CF5b0289F097Aff132F368FAc63aE5AfC6F17E8";

const contract = (provider: ethers.Signer | ethers.providers.BaseProvider) => {
  return new ethers.Contract(ADDRESS, AirdropCompiled.abi, provider) as Airdrop;
};

export const erc20 = (
  address: string,
  provider: ethers.Signer | ethers.providers.BaseProvider
) => {
  return new ethers.Contract(address, TSTCompiled.abi, provider) as TST;
};
// const contract = 1;
export type { Airdrop, TST };
export default { contract };
