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
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@typechain/hardhat");
const dotenv = __importStar(require("dotenv"));
require("hardhat-gas-reporter");
const config_1 = require("hardhat/config");
require("solidity-coverage");
require("hardhat-deploy");
const index_1 = require("./index");
dotenv.config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AURORA_TOKEN = process.env.AURORA_TOKEN || "";
const INFURA_TOKEN = process.env.INFURA_TOKEN || "";
(0, config_1.task)("deploy", "Deploy airdrop contract", async (_args, hre) => {
    const factory = await hre.ethers.getContractFactory("Airdrop");
    console.log("Deploying contract");
    const contract = (await hre.upgrades.deployProxy(factory, {
        kind: "uups",
    }));
    console.log("Deployed to:", contract.address);
});
(0, config_1.task)("deploy-tst", "Deploy TST Token", async (_args, hre) => {
    const factory = await hre.ethers.getContractFactory("TST");
    console.log("Deploying contract");
    const token = await factory.deploy();
    console.log("Deployed to:", token.address);
});
(0, config_1.task)("quick-test", "Check ERC20 Token metadata", async (_args, hre) => {
    const user_address = "0x32d4c5c556b5f7d5ad6855ed0e3d8f7ace6b1dc1";
    const token_address = "0x4988a896b1227218e4a686fde5eabdcabd91571f";
    const factory = await hre.ethers.getContractFactory("TST");
    const token = factory.attach(token_address);
    const balance = await token.balanceOf(user_address);
    console.log("Balance:", balance.toNumber());
});
(0, config_1.task)("create-airdrop-link", "Create an airdrop link")
    .addParam("token", "Address of the token")
    .addParam("amount", "Number of tokens")
    .setAction(async (args, hre) => {
    const currentAddress = (await hre.ethers.getSigners())[0].address;
    console.log("Using address:", currentAddress);
    const amount = hre.ethers.BigNumber.from(args.amount);
    const { airdrop } = await hre.getNamedAccounts();
    const airdropFactory = await hre.ethers.getContractFactory("Airdrop");
    const contract = airdropFactory.attach(airdrop);
    const tokenFactory = await hre.ethers.getContractFactory("TST");
    const token = tokenFactory.attach(args.token);
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    const xAmount = amount.mul(hre.ethers.BigNumber.from(10).pow(decimals));
    console.log(`Creating drop for ${amount} ${symbol} (${name})`);
    const currentBalance = await token.balanceOf(currentAddress);
    console.log("Current balance (without decimals)", currentBalance.toString());
    if (currentBalance < xAmount) {
        console.log("Not enough balance");
        return;
    }
    console.log("Setting allowance to create airdrops");
    await token.approve(contract.address, xAmount);
    const publicKeys = [];
    const secretKeys = [];
    const amounts = [];
    const wallet = hre.ethers.Wallet.createRandom();
    publicKeys.push(wallet.address);
    secretKeys.push(wallet.privateKey);
    amounts.push(xAmount);
    console.log("Creating link drops");
    const tx = await contract.createDrops(publicKeys, amounts, token.address);
    const receipt = await tx.wait(3);
    console.log(receipt);
    console.log("Links:");
    secretKeys.forEach((sk) => console.log(sk));
});
(0, config_1.task)("create-airdrop-link-tst", "Create an airdrop link for TST").setAction(async (_args, hre) => {
    const totalAirdrops = 3;
    const amount = 10;
    const { tst, airdrop } = await hre.getNamedAccounts();
    const airdropFactory = await hre.ethers.getContractFactory("Airdrop");
    const contract = airdropFactory.attach(airdrop);
    const tokenFactory = await hre.ethers.getContractFactory("TST");
    const token = tokenFactory.attach(tst);
    console.log("Setting allowance to create airdrops");
    await token.approve(contract.address, amount * totalAirdrops);
    const publicKeys = [];
    const secretKeys = [];
    const amounts = [];
    for (let i = 0; i < totalAirdrops; i++) {
        const wallet = hre.ethers.Wallet.createRandom();
        publicKeys.push(wallet.address);
        secretKeys.push(wallet.privateKey);
        amounts.push(amount);
    }
    console.log("Creating link drops");
    await contract.createDrops(publicKeys, amounts, token.address);
    console.log("Links:");
    secretKeys.forEach((sk) => console.log(sk));
});
(0, config_1.task)("claim-airdrop", "Claim airdrop link")
    .addPositionalParam("link", "Private link to the airdrop")
    .setAction(async (args, hre) => {
    const [_, alice] = await hre.ethers.getSigners();
    const { tst, airdrop } = await hre.getNamedAccounts();
    const airdropFactory = await hre.ethers.getContractFactory("Airdrop");
    const contract = airdropFactory.attach(airdrop);
    const tokenFactory = await hre.ethers.getContractFactory("TST");
    const token = tokenFactory.attach(tst);
    console.log("Checking initial balance");
    const initialBalance = await token.balanceOf(alice.address);
    console.log("Initial balance is:", initialBalance.toNumber());
    const wallet = new hre.ethers.Wallet(args.link);
    const signedMessage = await wallet.signMessage(Buffer.from(alice.address.slice(2), "hex"));
    const sig = hre.ethers.utils.splitSignature(signedMessage);
    console.log("Claiming tokens");
    await contract.connect(alice).claim(sig.v, sig.r, sig.s);
    console.log("Checking current balance");
    const currentBalance = await token.balanceOf(alice.address);
    console.log("Current balance is:", currentBalance.toNumber());
});
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config = {
    solidity: {
        version: "0.8.7",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1,
            },
        },
    },
    namedAccounts: {
        tst: {
            default: 1,
            auroraTunnel: "0xBdD6e7add8a2Df5565eF853b7f5fdA4b0f79e574",
            aurora: "0xBdD6e7add8a2Df5565eF853b7f5fdA4b0f79e574",
            local: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        },
        airdrop: {
            default: 2,
            auroraTunnel: index_1.ADDRESS,
            aurora: index_1.ADDRESS,
            local: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
        },
    },
    networks: {
        hardhat: {
            gas: 3000000000,
            blockGasLimit: 3000000000,
        },
        auroraTunnel: {
            url: `http://127.0.0.1:5432/`,
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 1313161554,
        },
        aurora: {
            url: `https://mainnet.aurora.dev/${AURORA_TOKEN}`,
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 1313161554,
        },
        auroraTestnet: {
            url: "https://testnet.aurora.dev",
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 1313161555,
        },
        local: {
            url: "http://localhost:8545",
            chainId: 31337,
            gasPrice: 120 * 1000000000,
        },
        ropsten: {
            url: `https://ropsten.infura.io/v3/${INFURA_TOKEN}`,
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 3,
            gasPrice: 50000000000,
            gasMultiplier: 2,
        },
        mainnet: {
            url: `https://mainnet.infura.io/v3/${INFURA_TOKEN}`,
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 1,
            gasMultiplier: 2,
            gas: 2 * 1000000,
        },
        goerli: {
            url: `https://goerli.infura.io/v3/${INFURA_TOKEN}`,
            accounts: [`0x${PRIVATE_KEY}`],
            chainId: 5,
            gasMultiplier: 2,
            gas: 2 * 1000000,
        },
    },
};
exports.default = config;
