"use client"

import { useAccount, useReadContract } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function SimpleContractTest() {
  const { isConnected, address } = useAccount()
  const [showTest, setShowTest] = useState(false)

  const { data: allNews } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsNoticiasGenerales",
    query: { enabled: isConnected },
  })

  const { data: myNews } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsMisNoticias",
    query: { enabled: isConnected },
  })

  const { data: myVotes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsMisVotaciones",
    query: { enabled: isConnected },
  })

  if (!isConnected || !showTest) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">🔧 Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowTest(!showTest)} variant="outline" size="sm">
            {showTest ? "Ocultar" : "Mostrar"} Test de Contrato
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">🔧 Test Rápido del Contrato</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Tu dirección:</strong> {address}
          </div>
          <div>
            <strong>Contrato:</strong> {CONTRACT_ADDRESS}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-green-50 rounded">
              <strong>Noticias Generales:</strong>
              <br />
              {allNews ? `${(allNews as any[]).length} encontradas` : "Cargando..."}
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <strong>Mis Noticias:</strong>
              <br />
              {myNews ? `${(myNews as any[]).length} encontradas` : "Cargando..."}
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <strong>Mis Votaciones:</strong>
              <br />
              {myVotes && Array.isArray(myVotes) && myVotes[0]
                ? `${(myVotes[0] as any[]).length} encontradas`
                : "0 encontradas"}
            </div>
          </div>
          <Button onClick={() => setShowTest(false)} variant="outline" size="sm">
            Ocultar Test
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
