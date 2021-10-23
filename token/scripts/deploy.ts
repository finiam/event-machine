/* eslint-disable camelcase */
import hre, { ethers } from "hardhat";
import { EventMachine, EventMachine__factory } from "../typechain";

async function main() {
  const EventMachine = (await ethers.getContractFactory(
    "EventMachine"
  )) as EventMachine__factory;
  const eventMachine = (await EventMachine.deploy()) as EventMachine;

  await eventMachine.deployed();

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    await eventMachine.deployTransaction.wait(5);

    await hre.run("verify:verify", {
      address: eventMachine.address,
    });
  }

  console.log("EventMachine deployed to:", eventMachine.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
