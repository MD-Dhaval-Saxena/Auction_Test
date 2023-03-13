const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");
const { boolean } = require("hardhat/internal/core/params/argumentTypes");
const wei_convert = (num) => hre.ethers.utils.parseEther(num.toString());
const convert_wei = (num) => hre.ethers.utils.formatEther(num);

describe("MY Auction Contract", () => {
  let myauction,
    owner,
    addr1,
    token,
    tokenMint,
    creAuction,
    auc,
    aftCnt,
    befCnt,
    addrZero;
  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    addrZero = "0x0000000000000000000000000000000000000000";
    const MyAuction = await ethers.getContractFactory("MyAuction");
    myauction = await MyAuction.deploy();
    await myauction.deployed();

    const Token = await ethers.getContractFactory("MyToken");
    token = await Token.deploy();
    await token.deployed();

    tokenMint = await token.connect(owner).mint(owner.address, 1, 10, "0x00");

    await token.connect(owner).setApprovalForAll(myauction.address, true);
  });

  describe("Checking Create Auction", async () => {
    let id, amount, data, priceTokens;
    beforeEach(async () => {
      data = "0x00";
      id = 1;
      amount = 10;
      priceTokens = wei_convert(0.1);
      befCnt = await myauction.counter();
      creAuction = await myauction.createAuction(
        token.address,
        id,
        amount,
        data,
        1,
        2,
        priceTokens
      );
    });
    it("Should Check Create Auction added to mapping", async () => {
      auc = await myauction.AuctionInfo(1);
      expect(auc).not.to.null;
    });
    it("Should Check Counter Increment", async () => {
      aftCnt = await myauction.counter();
      expect(aftCnt).greaterThan(befCnt);
    });
    it("Should Check Has Approval", async () => {
      let approval = await token.isApprovedForAll(
        owner.address,
        myauction.address
      );
      expect(approval).to.true;
    });
    it("Should Check if Tokens are received by contract", async () => {
      let aftBal = await token.balanceOf(myauction.address, id);
      expect(aftBal).to.equal(amount);
    });

    describe("Checking Place Bid Function", () => {
      let aucNum, bid1, bid2, add1, add2;
      let newBidPrice = wei_convert(1);
      let newBidPrice2 = wei_convert(2);
      beforeEach(async () => {
        [add1, add2] = await ethers.getSigners();

        bid1 = await myauction.connect(add1).place_Bid(1, {
          value: newBidPrice,
        });

        bid2 = await myauction.connect(add2).place_Bid(1, {
          value: newBidPrice2,
        });
        

      });
      it("Should Check the Auction Found or not", async () => {
        let aucOwner = (await myauction.AuctionInfo(1)).owner;
        // let aucOwner=(await myauction.AuctionInfo(0)).owner;
        expect(aucOwner).not.equal(addrZero);
      });
      it("Should Fail if bid Amount less than priceOfToken ", async () => {
        let aucTkPrice = (await myauction.AuctionInfo(1)).priceTokens;

        expect(newBidPrice).to.greaterThan(aucTkPrice);
      });
      it("Should Have Enough Tokens for Bid", async () => {
        let aucTokens = (await myauction.AuctionInfo(1)).amount;

        expect(aucTokens).to.greaterThan(0);
      });
      it("Should Place bid", async () => {
        expect(await myauction.Bid(add1.address)).to.equal(newBidPrice);
        expect(await myauction.Bid(add2.address)).to.equal(newBidPrice2);
        
      });

      describe("Checking Auction Winner", () => {
        let aucNum, winner, winAdd;
        aucNum = 1;
        beforeEach(async () => {
          winner = await myauction.Auction_Winner(aucNum, {
            from: owner.address,
          });
          winAdd = await myauction.winner();
        });
        it("Should Check if winner Address is address(0)", async () => {
          expect(winAdd).not.equal(addrZero);
        });
        it("Should Check Transfered token to highest bidder", async () => {
          let WinBal = await token.balanceOf(winAdd, aucNum);
          expect(WinBal).to.equal(1);
        });
        it('Should Delete the Winner Address',async()=>{
          // Winner bid will be removed
          let delWin=await myauction.Bid(winAdd);
          expect(delWin).to.equal(0);
        
        });
      });
      describe('Checking Withdraw Function', () => { 
        
        it('Should Check the Bid',async()=>{
          let bidBal=await myauction.Balance(add1.address);
          expect(bidBal).to.greaterThan(0);
        
        });
        it('Should Deduct the Bid fees',async()=>{
          let bidBal=(await myauction.Balance(add1.address)) /100;
          let tranAmount=(await myauction.Balance(add1.address)) -bidBal;
          // console.log(bidBal);
       
        });
       })
    });
  });
});
