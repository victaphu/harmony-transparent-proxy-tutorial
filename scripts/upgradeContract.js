const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const BOX_ADDRESS = "0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3"
async function main() {
  // Deploying
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  const box = await upgrades.upgradeProxy(BOX_ADDRESS, BoxV2);
  await box.setY(55);

  console.log("Box upgraded", box.address, await box.y());
}

main();