"use client"

import { useAccount, useReadContract } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ContractDebug() {
  const { isConnected, address } = useAccount()
  const [showDebug, setShowDebug] = useState(false)

  // Test directo de las funciones del contrato
  const { data: allNews } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsNoticiasGenerales",
    query: { enabled: isConnected },
  })

  const { data: myNews, error: myNewsError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsMisNoticias",
    query: { enabled: isConnected && !!address },
  })

  const { data: myVotes, error: myVotesError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsMisVotaciones",
    query: { enabled: isConnected && !!address },
  })

  if (!isConnected) return null

  return (
    <Card className="mb-6 border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-red-800">🚨 Debug del Contrato</CardTitle>
          <Button onClick={() => setShowDebug(!showDebug)} variant="outline" size="sm">
            {showDebug ? "Ocultar" : "Mostrar"} Debug
          </Button>
        </div>
      </CardHeader>
      {showDebug && (
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Información de conexión:</strong>
                <div className="mt-2 p-3 bg-gray-100 rounded">
                  <div>• Tu dirección: {address}</div>
                  <div>• Contrato: {CONTRACT_ADDRESS}</div>
                  <div>• Red: Sepolia</div>
                  <div>• Conectado: {isConnected ? "Sí" : "No"}</div>
                </div>
              </div>
              <div>
                <strong>Resultados de las funciones:</strong>
                <div className="mt-2 p-3 bg-gray-100 rounded">
                  <div>
                    • Noticias generales: {allNews ? `${(allNews as any[]).length} encontradas` : "Error/Vacío"}
                  </div>
                  <div>• Mis noticias: {myNews ? `${(myNews as any[]).length} encontradas` : "Error/Vacío"}</div>
                  <div>
                    • Mis votaciones:{" "}
                    {myVotes && Array.isArray(myVotes) ? `${myVotes.length} elementos` : "Error/Vacío"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <strong>Errores:</strong>
              <div className="mt-2 p-3 bg-red-50 rounded">
                <div>• Mis noticias: {myNewsError?.message || "Sin errores"}</div>
                <div>• Mis votaciones: {myVotesError?.message || "Sin errores"}</div>
              </div>
            </div>

            <div>
              <strong>Datos raw completos:</strong>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Ver datos completos</summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Noticias generales:</strong>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                      {JSON.stringify(
                        allNews,
                        (key, value) => (typeof value === "bigint" ? value.toString() : value),
                        2,
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>Mis noticias:</strong>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                      {JSON.stringify(
                        myNews,
                        (key, value) => (typeof value === "bigint" ? value.toString() : value),
                        2,
                      )}
                    </pre>
                  </div>
                  <div>
                    <strong>Mis votaciones:</strong>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                      {JSON.stringify(
                        myVotes,
                        (key, value) => (typeof value === "bigint" ? value.toString() : value),
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              </details>
            </div>

            <div className="p-3 bg-yellow-50 rounded">
              <strong>Comparación con Etherscan:</strong>
              <div className="text-xs mt-2">
                • Según Etherscan, tu dirección {address} debería tener:
                <br />• 2 noticias publicadas (IDs 0 y 1)
                <br />• 1 votación (noticia ID 2 con puntuación 10)
                <br />• Si aquí aparecen arrays vacíos, hay un problema de conexión o red
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
