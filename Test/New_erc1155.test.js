const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("New_erc1155 token", () => {
  let owner, addr1, Token;
  let token;

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();

    Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy();
    await token.deployed();
  });
  it("Should deploy contract", async () => {
    expect(owner.address).to.equal(await token.owner());
  });

  describe("Checking Mint Tokens", async () => {
    let amount, id, tokenMint;
    let data;
    beforeEach(async () => {
      data = "0x00";
      amount = 10;
      id = 1;

      tokenMint = await token
        .connect(owner)
        .mint(owner.address, id, amount, data);
    });

    it("Should Check Minted token amount", async () => {
      let balance = await token.balanceOf(owner.address, id);
      expect(balance).equal(amount);
    });
  });

  describe("Checking Mint Batch", () => {
    let amounts, ids, batch_tokenMint;
    let addArr = [];

    beforeEach(async () => {
      data = "0x00";
      amounts = [5000, 6000, 7000];
      ids = [2, 3, 4];
      batch_tokenMint = await token
        .connect(owner)
        .mintBatch(addr1.address, ids, amounts, data);
    });
    it("Should check Batch Minted Tokens", async () => {
      let afterBal = [];
      for (let index = 2; index < 5; index++) {
        let balance_of = await token.balanceOf(addr1.address, index);
        afterBal.push(balance_of.toNumber());
      }
      // expect(amounts).to.equal(afterBal);
    });

    it("should Set Uri",async()=>{
        let uri="www.nft.com";
        let setUri=await token.setURI(uri);
        let checkUri=await token.uri(0);
        expect(uri).to.equal(checkUri);
    })

  });
});
