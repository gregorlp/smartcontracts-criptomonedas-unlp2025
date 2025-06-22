"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ExternalLink, Copy, CheckCircle, AlertTriangle, ChevronDown, ChevronRight, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PinataSetupGuide() {
  const [step, setStep] = useState(1)
  const [jwtToken, setJwtToken] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    })
  }

  const validateJWT = (token: string) => {
    // Un JWT válido tiene 3 partes separadas por puntos
    const parts = token.split(".")
    return parts.length === 3 && parts.every((part) => part.length > 0)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-left">Configuración de Pinata IPFS</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {isOpen ? "Ocultar configuración" : "Mostrar configuración"}
                </span>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Configuración requerida:</strong> Para publicar noticias necesitas configurar las credenciales
                de Pinata IPFS. Esta configuración solo se hace una vez.
              </AlertDescription>
            </Alert>

            {/* Paso 1: Crear cuenta */}
            <div className={`p-4 rounded-lg border-2 ${step >= 1 ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  1
                </div>
                <h3 className="font-semibold">Crear cuenta en Pinata</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Ve a <strong>pinata.cloud</strong> y crea una cuenta gratuita si no tienes una.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open("https://app.pinata.cloud/register", "_blank")
                  setStep(Math.max(step, 2))
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Crear cuenta
              </Button>
            </div>

            {/* Paso 2: Ir a API Keys */}
            <div className={`p-4 rounded-lg border-2 ${step >= 2 ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  2
                </div>
                <h3 className="font-semibold">Ir a API Keys</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Una vez logueado, ve a la sección <strong>"API Keys"</strong> en el menú lateral izquierdo.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open("https://app.pinata.cloud/developers/api-keys", "_blank")
                  setStep(Math.max(step, 3))
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir a API Keys
              </Button>
            </div>

            {/* Paso 3: Crear nueva API Key */}
            <div className={`p-4 rounded-lg border-2 ${step >= 3 ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 3 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  3
                </div>
                <h3 className="font-semibold">Crear nueva API Key</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Haz clic en <strong>"New Key"</strong> y configura:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>
                    • <strong>Key Name:</strong> "VerificadorNoticias" (o el nombre que prefieras)
                  </li>
                  <li>
                    • <strong>Permissions:</strong> Marca <strong>"pinFileToIPFS"</strong>
                  </li>
                  <li>• Deja los demás permisos sin marcar por seguridad</li>
                </ul>
                <Button variant="outline" size="sm" onClick={() => setStep(Math.max(step, 4))}>
                  ✅ API Key creada
                </Button>
              </div>
            </div>

            {/* Paso 4: Copiar JWT Token */}
            <div
              className={`p-4 rounded-lg border-2 ${step >= 4 ? "border-green-200 bg-green-50" : "border-gray-200"}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= 4 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                  }`}
                >
                  4
                </div>
                <h3 className="font-semibold">Copiar JWT Token</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Después de crear la API Key, Pinata te mostrará el <strong>JWT Token</strong>. Cópialo y pégalo aquí
                  para validarlo:
                </p>

                <div className="space-y-2">
                  <Label htmlFor="jwt-input">JWT Token de Pinata:</Label>
                  <div className="flex gap-2">
                    <Input
                      id="jwt-input"
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={jwtToken}
                      onChange={(e) => setJwtToken(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => setJwtToken("")}>
                      Limpiar
                    </Button>
                  </div>
                </div>

                {jwtToken && (
                  <Alert
                    className={validateJWT(jwtToken) ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                  >
                    <div className="flex items-center gap-2">
                      {validateJWT(jwtToken) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={validateJWT(jwtToken) ? "text-green-700" : "text-red-700"}>
                        {validateJWT(jwtToken)
                          ? "✅ JWT Token válido - Cópialo a tu archivo .env.local"
                          : "❌ JWT Token inválido - Verifica que hayas copiado el token completo"}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {validateJWT(jwtToken) && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium mb-2">Agrega esta línea a tu archivo .env.local:</p>
                    <div className="flex items-center gap-2 p-2 bg-white rounded border font-mono text-sm">
                      <code className="flex-1">NEXT_PUBLIC_PINATA_JWT={jwtToken}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`NEXT_PUBLIC_PINATA_JWT=${jwtToken}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Paso 5: Reiniciar servidor */}
            {validateJWT(jwtToken) && (
              <div className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    5
                  </div>
                  <h3 className="font-semibold">Reiniciar servidor</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Después de actualizar el archivo .env.local, reinicia tu servidor de desarrollo:
                </p>
                <div className="flex items-center gap-2 p-2 bg-white rounded border font-mono text-sm">
                  <code className="flex-1">npm run dev</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard("npm run dev")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full">
                Cerrar configuración
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
