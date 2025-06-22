"use client"

import { areCredentialsConfigured } from "@/lib/ipfs-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function IPFSStatus() {
  const isConfigured = areCredentialsConfigured()

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Pinata IPFS Configurado</AlertTitle>
        <AlertDescription className="text-green-700">
          Las credenciales de Pinata están configuradas correctamente.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Configuración de Pinata Requerida</AlertTitle>
      <AlertDescription className="text-orange-700 space-y-3">
        <p>Para publicar noticias necesitas configurar las credenciales de Pinata:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ve a Pinata.cloud y crea una cuenta gratuita</li>
          <li>Ve a "API Keys" en tu dashboard</li>
          <li>Crea una nueva API Key con permisos "pinFileToIPFS"</li>
          <li>Copia el JWT token generado</li>
          <li>Agrégalo como variable de entorno</li>
        </ol>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={() => window.open("https://pinata.cloud/", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Ir a Pinata
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("=== INSTRUCCIONES PARA CONFIGURAR PINATA ===")
              console.log("1. Ve a https://pinata.cloud/")
              console.log("2. Crea una cuenta gratuita")
              console.log("3. Ve a 'API Keys' en tu dashboard")
              console.log("4. Haz clic en 'New Key'")
              console.log("5. Selecciona permisos: 'pinFileToIPFS'")
              console.log("6. Dale un nombre a tu API Key")
              console.log("7. Copia el JWT token generado")
              console.log("8. Agrega a tu .env.local:")
              console.log("   NEXT_PUBLIC_PINATA_JWT=tu_jwt_token_aqui")
              console.log("==========================================")
            }}
          >
            Ver instrucciones en consola
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
