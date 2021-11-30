import { keccak256 } from "@ethersproject/keccak256";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Airdrop, TST } from "../typechain-types";

describe("Airdrop", () => {
  it("Should be able to produce valid signature", async () => {
    const alice = ethers.Wallet.createRandom();
    const wallet = ethers.Wallet.createRandom();

    const aliceAddressB = Buffer.from(
      alice.address.slice(2).toLowerCase(),
      "hex"
    );
    const signedMsg = await wallet.signMessage(aliceAddressB);

    const sig = ethers.utils.splitSignature(signedMsg);

    const msg = Buffer.concat([
      Buffer.from(`\x19Ethereum Signed Message:\n20`, "utf-8"),
      aliceAddressB,
    ]);
    const check = keccak256(msg);

    let address = ethers.utils.recoverAddress(check, {
      v: sig.v,
      r: sig.r,
      s: sig.s,
    });

    expect(wallet.address).to.be.equal(address);
  });

  it("Should be able to produce valid signature online", async () => {
    const [_, alice] = await ethers.getSigners();

    const factoryAirdrop = await ethers.getContractFactory("Airdrop");
    const airdrop = (await upgrades.deployProxy(factoryAirdrop, {
      kind: "uups",
    })) as Airdrop;

    const wallet = ethers.Wallet.createRandom();

    const aliceAddressB = Buffer.from(alice.address.slice(2), "hex");
    const signedMsg = await wallet.signMessage(aliceAddressB);
    const sig = ethers.utils.splitSignature(signedMsg);

    const result = await airdrop
      .connect(alice)
      .recoverAddress(sig.v, sig.r, sig.s);

    expect(wallet.address).to.be.equal(result);
  });

  it("Should run the whole workflow", async () => {
    const factory = await ethers.getContractFactory("TST");
    const tst = await factory.deploy();

    const factoryAirdrop = await ethers.getContractFactory("Airdrop");
    const airdrop = (await upgrades.deployProxy(factoryAirdrop, {
      kind: "uups",
    })) as Airdrop;

    const totalAirdrops = 3;
    const amount = 10;

    await tst.approve(airdrop.address, amount * totalAirdrops);

    const publicKeys = [];
    const secretKeys = [];
    const amounts = [];

    for (let i = 0; i < totalAirdrops; i++) {
      const wallet = ethers.Wallet.createRandom();

      publicKeys.push(wallet.address);
      secretKeys.push(wallet.privateKey);
      amounts.push(amount);
    }

    console.log("Creating link drops");
    await airdrop.createDrops(publicKeys, amounts, tst.address);

    const [_, alice] = await ethers.getSigners();

    const initialBalance = await tst.balanceOf(alice.address);
    console.log("Initial balance is:", initialBalance.toNumber());

    const wallet = new ethers.Wallet(secretKeys[0]);
    const signedMessage = await wallet.signMessage(
      Buffer.from(alice.address.slice(2), "hex")
    );

    const sig = ethers.utils.splitSignature(signedMessage);

    console.log("Claiming tokens");
    await airdrop.connect(alice).claim(sig.v, sig.r, sig.s);

    const currentBalance = await tst.balanceOf(alice.address);
    console.log("Current balance is:", currentBalance.toNumber());
  });
});
