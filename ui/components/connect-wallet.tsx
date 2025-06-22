"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wallet, LogOut, Smartphone, Monitor, ExternalLink, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const [isMobile, setIsMobile] = useState(false)
  const [hasMetaMask, setHasMetaMask] = useState(false)

  useEffect(() => {
    // Detectar si es móvil
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    // Detectar MetaMask
    const checkMetaMask = () => {
      setHasMetaMask(typeof window !== "undefined" && !!window.ethereum?.isMetaMask)
    }

    checkMobile()
    checkMetaMask()

    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleConnect = async () => {
    try {
      if (connectors.length > 0) {
        await connect({ connector: connectors[0] })
      }
    } catch (err) {
      console.error("Error connecting:", err)
    }
  }

  const openMetaMaskMobile = () => {
    const currentUrl = window.location.href
    const metamaskUrl = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, "")}`
    window.open(metamaskUrl, "_blank")
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
          <Wallet className="w-4 h-4 text-green-600" />
          <span className="text-green-800 font-medium">{formatAddress(address)}</span>
        </div>
        <Button
          onClick={() => disconnect()}
          variant="outline"
          size="sm"
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Desconectar
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Conectar Wallet</h3>

        {!hasMetaMask && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>MetaMask no detectado.</strong> Para usar esta aplicación necesitas tener MetaMask instalado.
            </AlertDescription>
          </Alert>
        )}

        {isMobile ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Smartphone className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Dispositivo móvil detectado</p>
            </div>

            {hasMetaMask ? (
              <div className="space-y-3">
                <Button onClick={handleConnect} disabled={isPending} className="w-full" size="lg">
                  <Wallet className="w-5 h-5 mr-2" />
                  {isPending ? "Conectando..." : "Conectar MetaMask"}
                </Button>

                <Button onClick={openMetaMaskMobile} variant="outline" className="w-full" size="lg">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Abrir en MetaMask Mobile
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm text-yellow-800 mb-3">
                    Para conectar desde móvil, necesitas usar el navegador integrado de MetaMask:
                  </p>
                  <ol className="text-xs text-yellow-700 text-left space-y-1 mb-3">
                    <li>1. Instala MetaMask Mobile</li>
                    <li>2. Abre MetaMask</li>
                    <li>3. Ve a la pestaña "Browser"</li>
                    <li>4. Navega a esta página</li>
                    <li>5. Conecta tu wallet</li>
                  </ol>
                </div>

                <Button
                  onClick={() => {
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
                    if (isIOS) {
                      window.open("https://apps.apple.com/app/metamask/id1438144202", "_blank")
                    } else {
                      window.open("https://play.google.com/store/apps/details?id=io.metamask", "_blank")
                    }
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Descargar MetaMask
                </Button>

                <Button onClick={openMetaMaskMobile} variant="outline" className="w-full" size="lg">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Intentar abrir en MetaMask
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center mb-4">
              <Monitor className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Escritorio detectado</p>
            </div>

            {hasMetaMask ? (
              <Button onClick={handleConnect} disabled={isPending} className="w-full" size="lg">
                <Wallet className="w-4 h-4 mr-2" />
                {isPending ? "Conectando..." : "Conectar MetaMask"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm text-yellow-800 mb-3">MetaMask no está instalado en tu navegador</p>
                </div>
                <Button
                  onClick={() => window.open("https://metamask.io/download/", "_blank")}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Instalar MetaMask
                </Button>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error de conexión:</strong> {error.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
