"use client"

import { areCredentialsConfigured } from "@/lib/ipfs-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { PinataSetupGuide } from "@/components/pinata-setup-guide"

export function IPFSStatus() {
  const isConfigured = areCredentialsConfigured()
  const [showSetup, setShowSetup] = useState(false)

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-6">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Pinata IPFS Configurado</AlertTitle>
        <AlertDescription className="text-green-700">
          Las credenciales de Pinata están configuradas correctamente. Ya puedes publicar noticias.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 mb-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Configuración de Pinata Requerida</AlertTitle>
        <AlertDescription className="text-orange-700">
          <div className="space-y-3">
            <p>Para publicar noticias necesitas configurar las credenciales de Pinata IPFS.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSetup(!showSetup)}
              className="bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSetup ? "Ocultar" : "Mostrar"} guía de configuración
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {showSetup && <PinataSetupGuide />}
    </div>
  )
}
