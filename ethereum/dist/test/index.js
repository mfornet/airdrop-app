"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const keccak256_1 = require("@ethersproject/keccak256");
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
describe("Airdrop", () => {
    it("Should be able to produce valid signature", async () => {
        const alice = hardhat_1.ethers.Wallet.createRandom();
        const wallet = hardhat_1.ethers.Wallet.createRandom();
        const aliceAddressB = Buffer.from(alice.address.slice(2).toLowerCase(), "hex");
        const signedMsg = await wallet.signMessage(aliceAddressB);
        const sig = hardhat_1.ethers.utils.splitSignature(signedMsg);
        const msg = Buffer.concat([
            Buffer.from(`\x19Ethereum Signed Message:\n20`, "utf-8"),
            aliceAddressB,
        ]);
        const check = (0, keccak256_1.keccak256)(msg);
        let address = hardhat_1.ethers.utils.recoverAddress(check, {
            v: sig.v,
            r: sig.r,
            s: sig.s,
        });
        (0, chai_1.expect)(wallet.address).to.be.equal(address);
    });
    it("Should be able to produce valid signature online", async () => {
        const [_, alice] = await hardhat_1.ethers.getSigners();
        const factoryAirdrop = await hardhat_1.ethers.getContractFactory("Airdrop");
        const airdrop = (await hardhat_1.upgrades.deployProxy(factoryAirdrop, {
            kind: "uups",
        }));
        const wallet = hardhat_1.ethers.Wallet.createRandom();
        const aliceAddressB = Buffer.from(alice.address.slice(2), "hex");
        const signedMsg = await wallet.signMessage(aliceAddressB);
        const sig = hardhat_1.ethers.utils.splitSignature(signedMsg);
        const result = await airdrop
            .connect(alice)
            .recoverAddress(alice.address, sig.v, sig.r, sig.s);
        (0, chai_1.expect)(wallet.address).to.be.equal(result);
    });
    it("Should run the whole workflow", async () => {
        const factory = await hardhat_1.ethers.getContractFactory("TST");
        const tst = await factory.deploy();
        const factoryAirdrop = await hardhat_1.ethers.getContractFactory("Airdrop");
        const airdrop = (await hardhat_1.upgrades.deployProxy(factoryAirdrop, {
            kind: "uups",
        }));
        const totalAirdrops = 3;
        const amount = 10;
        await tst.approve(airdrop.address, amount * totalAirdrops);
        const publicKeys = [];
        const secretKeys = [];
        const amounts = [];
        for (let i = 0; i < totalAirdrops; i++) {
            const wallet = hardhat_1.ethers.Wallet.createRandom();
            publicKeys.push(wallet.address);
            secretKeys.push(wallet.privateKey);
            amounts.push(amount);
        }
        console.log("Creating link drops");
        await airdrop.createDrops(publicKeys, amounts, tst.address);
        const [_, alice] = await hardhat_1.ethers.getSigners();
        const initialBalance = await tst.balanceOf(alice.address);
        console.log("Initial balance is:", initialBalance.toNumber());
        const wallet = new hardhat_1.ethers.Wallet(secretKeys[0]);
        const signedMessage = await wallet.signMessage(Buffer.from(alice.address.slice(2), "hex"));
        const sig = hardhat_1.ethers.utils.splitSignature(signedMessage);
        console.log("Claiming tokens");
        await airdrop.connect(alice).claim(sig.v, sig.r, sig.s);
        const currentBalance = await tst.balanceOf(alice.address);
        console.log("Current balance is:", currentBalance.toNumber());
    });
});
