const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Contract = await hre.ethers.getContractFactory("ProductRegistry");
  const contract = await Contract.deploy();

  // wait for deployment (v6+)
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("ProductRegistry deployed to:", contractAddress);

  // Write minimal ABI file for backend use
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "ProductRegistry.sol",
    "ProductRegistry.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const outDir = path.join(__dirname, "..", "..", "backend", "abis");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "ProductRegistry.json"),
    JSON.stringify({ abi: artifact.abi }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
