import { decodeAbiParameters, parseAbiParameters } from "viem"

// Función para decodificar manualmente la respuesta de obtenerPreviewsMisNoticias
export function decodePreviewsMisNoticias(hexData: string) {
  try {
    console.log("🔧 Decodificando obtenerPreviewsMisNoticias manualmente...")
    console.log("Hex data:", hexData)

    // El ABI de retorno para obtenerPreviewsMisNoticias es: Preview[] previews
    // Donde Preview es: (uint256,address,string,string,string,uint256,uint256,string)
    const abiTypes = parseAbiParameters("(uint256,address,string,string,string,uint256,uint256,string)[] previews")

    const decoded = decodeAbiParameters(abiTypes, hexData as `0x${string}`)
    console.log("✅ Decodificación exitosa:", decoded)

    return decoded[0] // El primer elemento es el array de previews
  } catch (error) {
    console.error("❌ Error decodificando:", error)
    return null
  }
}

// Función para decodificar manualmente la respuesta de obtenerPreviewsMisVotaciones
export function decodePreviewsMisVotaciones(hexData: string) {
  try {
    console.log("🔧 Decodificando obtenerPreviewsMisVotaciones manualmente...")
    console.log("Hex data:", hexData)

    // El ABI de retorno es: (Preview[] previews, uint256[] puntuaciones)
    const abiTypes = parseAbiParameters(
      "(uint256,address,string,string,string,uint256,uint256,string)[] previews, uint256[] puntuaciones",
    )

    const decoded = decodeAbiParameters(abiTypes, hexData as `0x${string}`)
    console.log("✅ Decodificación exitosa:", decoded)

    return {
      previews: decoded[0],
      puntuaciones: decoded[1],
    }
  } catch (error) {
    console.error("❌ Error decodificando:", error)
    return null
  }
}
