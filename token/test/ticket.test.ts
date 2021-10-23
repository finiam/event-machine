/* eslint-disable camelcase */
import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { add } from "date-fns";
import { ethers } from "hardhat";
import { EventMachine, EventMachine__factory } from "../typechain";

describe("Ticket", function () {
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let EventMachine: EventMachine__factory;
  let eventMachine: EventMachine;

  this.beforeAll(async () => {
    // force await so gas reporter works
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
  });

  this.beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    EventMachine = (await ethers.getContractFactory(
      "EventMachine"
    )) as EventMachine__factory;
    eventMachine = await EventMachine.deploy();
    await eventMachine.deployed();
  });

  async function createEvent(
    ticketPrice: string,
    ticketDate: Date = add(new Date(), { days: 1 }),
    creator: SignerWithAddress = owner
  ): Promise<BigNumber> {
    await eventMachine
      .connect(creator)
      .createEvent(
        ethers.utils.parseEther(ticketPrice),
        Math.floor(ticketDate.getTime() / 1000)
      );

    const transfers = await eventMachine.queryFilter(
      eventMachine.filters.CreateEvent(creator.address)
    );

    return transfers[transfers.length - 1].args.eventId;
  }

  it("should create event", async function () {
    const receipt = eventMachine.createEvent(
      ethers.utils.parseEther("0.1"),
      Math.floor(add(new Date(), { days: 10 }).getTime() / 1000)
    );

    await expect(receipt)
      .to.be.emit(eventMachine, "CreateEvent")
      .withArgs(
        owner.address,
        1,
        ethers.utils.parseEther("0.1"),
        Math.floor(add(new Date(), { days: 10 }).getTime() / 1000)
      );
  });

  it("should cancel event", async function () {
    const eventId = await createEvent("0.1");
    const receipt = eventMachine.cancelEvent(eventId);

    await expect(receipt)
      .to.be.emit(eventMachine, "CancelEvent")
      .withArgs(owner.address, eventId);
  });

  it("should buy ticket", async function () {
    const eventId = await createEvent("0.1");
    const receipt = eventMachine.buyTicket(eventId, {
      value: ethers.utils.parseEther("0.1"),
    });

    await expect(receipt)
      .to.be.emit(eventMachine, "BuyTicket")
      .withArgs(owner.address, eventId);
    expect(await eventMachine.getBalance(owner.address, eventId)).to.eq(
      ethers.utils.parseEther("0.1")
    );
  });

  it("should cancel ticket", async function () {
    const eventId = await createEvent("0.1");
    await eventMachine.connect(other).buyTicket(eventId, {
      value: ethers.utils.parseEther("0.1"),
    });
    const receipt = await eventMachine.connect(other).cancelTicket(eventId);

    await expect(receipt)
      .to.be.emit(eventMachine, "CancelTicket")
      .withArgs(other.address, eventId);
    await expect(receipt).to.changeEtherBalance(
      other,
      ethers.utils.parseEther("0.075")
    );
    expect(await eventMachine.getBalance(owner.address, eventId)).to.eq(
      ethers.utils.parseEther("0.025")
    );
  });

  it("should revert cancel ticket", async function () {
    const eventId = await createEvent("0.1");
    // buy with owner
    await eventMachine.buyTicket(eventId, {
      value: ethers.utils.parseEther("0.1"),
    });
    // cancel with other
    const receipt = eventMachine.connect(other).cancelTicket(eventId);

    await expect(receipt).to.be.revertedWith("ticket needs to be bought");
  });

  it("should not cancel more than one time", async function () {
    const eventId = await createEvent("0.1");
    await eventMachine.connect(other).buyTicket(eventId, {
      value: ethers.utils.parseEther("0.1"),
    });
    await eventMachine.connect(other).cancelTicket(eventId);
    const receipt = eventMachine.connect(other).cancelTicket(eventId);

    expect(await eventMachine.getBalance(owner.address, eventId)).to.eq(
      ethers.utils.parseEther("0.025")
    );
    expect(
      (await eventMachine.queryFilter(eventMachine.filters.CancelTicket()))
        .length === 1
    );
    await expect(receipt).to.be.revertedWith("ticket needs to be bought");
  });
});
