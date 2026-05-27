import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=================================");
  console.log("Deploying ZKRED Contracts");
  console.log("Deployer :", deployer.address);
  console.log("Network  : Ritual Testnet (1979)");
  console.log("=================================\n");

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance  :", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("Deployer has no ETH. Get testnet ETH from https://faucet.ritual.net");
  }

  // Step 1 — Deploy DailyCheckIn first (ZKREDBadge needs its address)
  console.log("Deploying DailyCheckIn...");
  const CheckIn = await ethers.getContractFactory("DailyCheckIn");
  const checkIn = await CheckIn.deploy();
  await checkIn.waitForDeployment();
  const checkInAddr = await checkIn.getAddress();
  console.log("DailyCheckIn deployed:", checkInAddr);

  // Step 2 — Deploy ZKREDBadge with CheckIn address for on-chain eligibility
  console.log("\nDeploying ZKREDBadge...");
  const Badge = await ethers.getContractFactory("ZKREDBadge");
  const badge = await Badge.deploy(checkInAddr);
  await badge.waitForDeployment();
  const badgeAddr = await badge.getAddress();
  console.log("ZKREDBadge deployed :", badgeAddr);

  console.log("\n=================================");
  console.log("SUCCESS — Add these to .env.local");
  console.log("=================================");
  console.log(`NEXT_PUBLIC_BADGE_CONTRACT=${badgeAddr}`);
  console.log(`NEXT_PUBLIC_CHECKIN_CONTRACT=${checkInAddr}`);
  console.log("=================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
