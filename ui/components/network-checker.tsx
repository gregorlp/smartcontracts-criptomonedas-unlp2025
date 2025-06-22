"use client"

import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { sepolia } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"

export function NetworkChecker() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  if (!isConnected) return null

  const isCorrectNetwork = chainId === sepolia.id
  const currentNetwork = chainId === 1 ? "Mainnet" : chainId === 11155111 ? "Sepolia" : `Red ${chainId}`

  if (isCorrectNetwork) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Red correcta:</strong> Conectado a Sepolia (ID: {chainId})
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="space-y-3">
          <div>
            <strong>Red incorrecta:</strong> Estás conectado a {currentNetwork} (ID: {chainId})
          </div>
          <div>Esta aplicación requiere la red Sepolia para funcionar correctamente.</div>
          <Button
            onClick={() => switchChain({ chainId: sepolia.id })}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            Cambiar a Sepolia
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
