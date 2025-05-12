const hre = require("hardhat");

async function main() {
  console.log("Deploying CarbonCreditsMarketplace contract...");

  const CarbonCreditsMarketplace = await hre.ethers.getContractFactory("CarbonCreditsMarketplace");
  const carbonCredits = await CarbonCreditsMarketplace.deploy();

  await carbonCredits.waitForDeployment();

  console.log(
    `CarbonCreditsMarketplace deployed to ${await carbonCredits.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 