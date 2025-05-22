import { ethers } from "hardhat";

async function main() {
    const initialSupply = ethers.parseEther("1000000"); // 1 million tokens
    const pricePerCarbonCredit = ethers.parseEther("0.1"); // 0.1 ETH per credit

    const CarbonCreditsMarketplace = await ethers.getContractFactory("CarbonCreditsMarketplace");
    const marketplace = await CarbonCreditsMarketplace.deploy(initialSupply, pricePerCarbonCredit);

    await marketplace.waitForDeployment();

    console.log("CarbonCreditsMarketplace deployed to:", await marketplace.getAddress());
    console.log("Initial supply:", initialSupply.toString());
    console.log("Price per carbon credit:", pricePerCarbonCredit.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
