"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.erc20 = exports.ADDRESS = void 0;
const ethers_1 = require("ethers");
const AirdropCompiled = __importStar(require("./artifacts/contracts/Airdrop.sol/Airdrop.json"));
const TSTCompiled = __importStar(require("./artifacts/contracts/TST.sol/TST.json"));
exports.ADDRESS = "0x1CF5b0289F097Aff132F368FAc63aE5AfC6F17E8";
const contract = (provider) => {
    return new ethers_1.ethers.Contract(exports.ADDRESS, AirdropCompiled.abi, provider);
};
const erc20 = (address, provider) => {
    return new ethers_1.ethers.Contract(address, TSTCompiled.abi, provider);
};
exports.erc20 = erc20;
exports.default = { contract };
