const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("📦 Obteniendo contrato...");
  const Verificador = await hre.ethers.getContractFactory("VerificadorNoticias");

  console.log("🚀 Deployando contrato...");
  const contrato = await Verificador.deploy();
  await contrato.waitForDeployment();

  const address = await contrato.getAddress();
  const network = hre.network.name;

  console.log(`✅ Contrato desplegado en la red ${network}: ${address}`);

  console.log("📝 Guardando dirección en direccion-contrato.json...");
  fs.writeFileSync(
    "./direccion-contrato.json",
    JSON.stringify({ red: network, address }, null, 2)
  );

  console.log("📁 Archivo generado correctamente.");
}

main().catch((error) => {
  console.error("❌ Error en el deploy:", error);
  process.exitCode = 1;
});