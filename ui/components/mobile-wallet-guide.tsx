"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Download, ExternalLink, Wifi } from "lucide-react"

export function MobileWalletGuide() {
  const openMetaMaskDownload = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)

    if (isIOS) {
      window.open("https://apps.apple.com/app/metamask/id1438144202", "_blank")
    } else if (isAndroid) {
      window.open("https://play.google.com/store/apps/details?id=io.metamask", "_blank")
    } else {
      window.open("https://metamask.io/download/", "_blank")
    }
  }

  const openInMetaMaskMobile = () => {
    const currentUrl = window.location.href
    const metamaskUrl = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, "")}`
    window.open(metamaskUrl, "_blank")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Conectar desde Móvil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Método más simple y confiable */}
        <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
          <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-800">
            <span className="bg-orange-200 text-orange-900 px-2 py-1 rounded text-sm">Recomendado</span>
            Método Simple
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-orange-700">La forma más fácil de conectar desde móvil:</p>
            <ol className="text-sm space-y-2 ml-4 text-orange-700">
              <li>1. Instala MetaMask en tu móvil (si no lo tienes)</li>
              <li>2. Abre MetaMask</li>
              <li>3. Ve a la pestaña "Browser" o "Navegador"</li>
              <li>4. Copia y pega esta URL en el navegador de MetaMask</li>
              <li>5. Conecta tu wallet normalmente</li>
            </ol>
            <div className="flex gap-2">
              <Button onClick={openMetaMaskDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar MetaMask
              </Button>
              <Button onClick={openInMetaMaskMobile} className="bg-orange-600 hover:bg-orange-700" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir en MetaMask
              </Button>
            </div>
          </div>
        </div>

        {/* Método alternativo */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Alternativo</span>
            Navegador Móvil
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Si prefieres usar el navegador de tu móvil:</p>
            <ol className="text-sm space-y-2 ml-4">
              <li>1. Asegúrate de tener MetaMask instalado</li>
              <li>2. Abre esta página en tu navegador móvil</li>
              <li>3. Haz clic en "Conectar Wallet"</li>
              <li>4. Selecciona "MetaMask" o "Injected"</li>
            </ol>
          </div>
        </div>

        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Asegúrate de estar conectado a la red Sepolia en tu wallet y tener algo de ETH
            de prueba para las transacciones de gas.
          </AlertDescription>
        </Alert>

        {/* Información adicional */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">¿Necesitas ETH de prueba para Sepolia?</h4>
          <p className="text-sm text-gray-600 mb-3">
            Para usar la aplicación necesitas ETH de prueba en la red Sepolia para pagar las transacciones.
          </p>
          <Button variant="outline" size="sm" onClick={() => window.open("https://sepoliafaucet.com/", "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Obtener ETH de prueba
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
