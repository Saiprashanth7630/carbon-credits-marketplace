import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import "@nomicfoundation/hardhat-ethers";
import { ethers } from "hardhat";

module.exports = buildModule("CarbonCreditsMarketplace", (m) => {
  const carbonCreditsMarketplaceContract = m.contract("CarbonCreditsMarketplace", [
    "initialSupply",
    "pricePerCarbonCredit"
  ], {
    // gasPrice: ethers.parseUnits("50", "gwei"), // Set gas price directly in options
  });

  return { carbonCreditsMarketplaceContract };
});
