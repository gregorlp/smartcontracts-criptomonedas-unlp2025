import { create } from "ipfs-http-client"

// CONFIGURACIÓN PARA PINATA IPFS
// 1. Ve a https://pinata.cloud/
// 2. Crea una cuenta gratuita
// 3. Ve a API Keys en tu dashboard
// 4. Crea una nueva API Key con permisos de "pinFileToIPFS"
// 5. Copia el JWT token

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "TU_PINATA_JWT"

// Verificar si las credenciales están configuradas
const areCredentialsConfigured = () => {
  return PINATA_JWT !== "TU_PINATA_JWT" && PINATA_JWT && PINATA_JWT.length > 0
}

export const ipfsClient = create({
  host: "api.pinata.cloud",
  port: 443,
  protocol: "https",
  headers: {
    authorization: `Bearer ${PINATA_JWT}`,
  },
})

export async function uploadToIPFS(file: File): Promise<string> {
  // Verificar credenciales antes de intentar subir
  if (!areCredentialsConfigured()) {
    throw new Error(
      "Las credenciales de Pinata no están configuradas. Por favor:\n" +
        "1. Ve a https://pinata.cloud/ y crea una cuenta\n" +
        "2. Ve a 'API Keys' en tu dashboard\n" +
        "3. Crea una nueva API Key con permisos 'pinFileToIPFS'\n" +
        "4. Agrega tu JWT token en las variables de entorno:\n" +
        "   NEXT_PUBLIC_PINATA_JWT=tu_jwt_token\n" +
        "5. O reemplaza directamente en lib/ipfs-client.ts",
    )
  }

  try {
    console.log("Subiendo archivo a IPFS via Pinata...", file.name)

    // Usar la API REST de Pinata directamente para mejor compatibilidad
    const formData = new FormData()
    formData.append("file", file)

    // Metadata opcional para Pinata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: "VerificadorNoticias",
        timestamp: new Date().toISOString(),
      },
    })
    formData.append("pinataMetadata", metadata)

    const options = JSON.stringify({
      cidVersion: 1,
    })
    formData.append("pinataOptions", options)

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }

    const result = await response.json()
    console.log("Archivo subido exitosamente a Pinata:", result.IpfsHash)
    return result.IpfsHash
  } catch (error: any) {
    console.error("Error detallado de Pinata:", error)

    if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
      throw new Error(
        "Error de autenticación con Pinata. Verifica que:\n" +
          "1. Tu JWT token sea correcto y válido\n" +
          "2. La API Key tenga permisos 'pinFileToIPFS'\n" +
          "3. Tu cuenta de Pinata esté activa\n" +
          "4. No hayas excedido los límites de tu plan",
      )
    }

    if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
      throw new Error(
        "Permisos insuficientes. Asegúrate de que tu API Key de Pinata tenga permisos para 'pinFileToIPFS'",
      )
    }

    throw new Error(`Error al subir archivo a Pinata: ${error.message || error}`)
  }
}

export { areCredentialsConfigured }
