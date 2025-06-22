const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const data = JSON.parse(fs.readFileSync("./direccion-contrato.json", "utf8"));
  const contratoAddress = data.address;

  console.log(`🔎 Verificando contrato en ${hre.network.name}...`);
  console.log(`📍 Dirección: ${contratoAddress}`);

  await hre.run("verify:verify", {
    address: contratoAddress,
    constructorArguments: [] // Si tu contrato tiene argumentos, los pasás acá
  });

  console.log("✅ Contrato verificado correctamente en Etherscan.");
}

main().catch((error) => {
  console.error("❌ Error al verificar contrato:", error);
  process.exitCode = 1;
});