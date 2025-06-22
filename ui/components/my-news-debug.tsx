"use client"

import { useAccount, useReadContract } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function MyNewsDebug() {
  const { isConnected, address } = useAccount()
  const [showDebug, setShowDebug] = useState(true)

  // Test directo de obtenerPreviewsMisNoticias
  const {
    data: misNoticiasData,
    isLoading: misNoticiasLoading,
    error: misNoticiasError,
    refetch: refetchMisNoticias,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsMisNoticias",
    query: {
      enabled: isConnected && !!address,
    },
  })

  // Test de obtenerPreviewsNoticiasGenerales (que sabemos que funciona)
  const {
    data: noticiasGeneralesData,
    isLoading: noticiasGeneralesLoading,
    error: noticiasGeneralesError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsNoticiasGenerales",
    query: {
      enabled: isConnected,
    },
  })

  if (!isConnected || !showDebug) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">🔧 Debug Mis Noticias</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowDebug(!showDebug)} variant="outline" size="sm">
            {showDebug ? "Ocultar" : "Mostrar"} Debug
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Filtrar noticias generales por mi dirección
  const misNoticiasFromGeneral = noticiasGeneralesData
    ? (noticiasGeneralesData as any[]).filter((news: any) => {
        const autorFromNews = Array.isArray(news) ? news[1] : news.autor
        return autorFromNews?.toLowerCase() === address?.toLowerCase()
      })
    : []

  return (
    <Card className="mb-6 border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-orange-800">🔧 Diagnóstico: Mis Noticias</CardTitle>
          <Button onClick={() => setShowDebug(false)} variant="outline" size="sm">
            Ocultar Debug
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 text-sm">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded">
              <strong>Tu información:</strong>
              <div className="mt-2 space-y-1">
                <div>Dirección: {address}</div>
                <div>Conectado: {isConnected ? "✅ Sí" : "❌ No"}</div>
                <div>Contrato: {CONTRACT_ADDRESS}</div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>Según Etherscan deberías tener:</strong>
              <div className="mt-2 space-y-1">
                <div>• 2 noticias publicadas</div>
                <div>• ID 0: "Libra Estafa"</div>
                <div>• ID 1: "Iran uso armas nucleares"</div>
                <div>• Ambas con tu dirección como autor</div>
              </div>
            </div>
          </div>

          {/* Test 1: obtenerPreviewsMisNoticias */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">PROBLEMA</span>
              Test 1: obtenerPreviewsMisNoticias
            </h4>
            <div className="space-y-2">
              <div>
                <strong>Estado:</strong> {misNoticiasLoading ? "🔄 Cargando..." : "✅ Completado"}
              </div>
              <div>
                <strong>Error:</strong> {misNoticiasError ? `❌ ${misNoticiasError.message}` : "✅ Sin errores"}
              </div>
              <div>
                <strong>Datos recibidos:</strong> {misNoticiasData ? "✅ Sí" : "❌ No"}
              </div>
              <div>
                <strong>Tipo:</strong> {typeof misNoticiasData}
              </div>
              <div>
                <strong>Es array:</strong> {Array.isArray(misNoticiasData) ? "✅ Sí" : "❌ No"}
              </div>
              <div>
                <strong>Longitud:</strong> {Array.isArray(misNoticiasData) ? misNoticiasData.length : "N/A"}
              </div>

              {misNoticiasData && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600">Ver datos raw</summary>
                  <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-32 border">
                    {JSON.stringify(
                      misNoticiasData,
                      (key, value) => (typeof value === "bigint" ? value.toString() : value),
                      2,
                    )}
                  </pre>
                </details>
              )}

              <Button onClick={() => refetchMisNoticias()} variant="outline" size="sm" disabled={misNoticiasLoading}>
                🔄 Reintentar obtenerPreviewsMisNoticias
              </Button>
            </div>
          </div>

          {/* Test 2: obtenerPreviewsNoticiasGenerales */}
          <div className="border rounded p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">FUNCIONA</span>
              Test 2: obtenerPreviewsNoticiasGenerales
            </h4>
            <div className="space-y-2">
              <div>
                <strong>Estado:</strong> {noticiasGeneralesLoading ? "🔄 Cargando..." : "✅ Completado"}
              </div>
              <div>
                <strong>Error:</strong>{" "}
                {noticiasGeneralesError ? `❌ ${noticiasGeneralesError.message}` : "✅ Sin errores"}
              </div>
              <div>
                <strong>Total noticias:</strong>{" "}
                {Array.isArray(noticiasGeneralesData) ? noticiasGeneralesData.length : "N/A"}
              </div>
              <div>
                <strong>Mis noticias filtradas:</strong> {misNoticiasFromGeneral.length}
              </div>

              {misNoticiasFromGeneral.length > 0 && (
                <div className="mt-3 p-2 bg-green-50 rounded">
                  <strong>✅ Tus noticias encontradas:</strong>
                  {misNoticiasFromGeneral.map((news: any, index: number) => {
                    const titulo = Array.isArray(news) ? news[2] : news.titulo
                    const id = Array.isArray(news) ? news[0] : news.id
                    return (
                      <div key={index} className="text-xs mt-1">
                        • ID {id?.toString()}: {titulo}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Conclusión */}
          <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <h4 className="font-semibold text-yellow-800 mb-2">🔍 Diagnóstico:</h4>
            <div className="text-yellow-700 space-y-1">
              {misNoticiasData && Array.isArray(misNoticiasData) && misNoticiasData.length > 0 ? (
                <p>✅ obtenerPreviewsMisNoticias funciona correctamente</p>
              ) : misNoticiasError ? (
                <p>❌ obtenerPreviewsMisNoticias tiene un error: {misNoticiasError.message}</p>
              ) : (
                <p>⚠️ obtenerPreviewsMisNoticias devuelve datos vacíos o nulos</p>
              )}

              {misNoticiasFromGeneral.length > 0 ? (
                <p>✅ Tus noticias SÍ existen (encontradas via filtrado)</p>
              ) : (
                <p>❌ No se encontraron tus noticias ni siquiera filtrando</p>
              )}

              <p className="mt-2 font-medium">
                {misNoticiasFromGeneral.length > 0 && (!misNoticiasData || !Array.isArray(misNoticiasData))
                  ? "💡 Solución: Usar filtrado de noticias generales como alternativa"
                  : misNoticiasData && Array.isArray(misNoticiasData) && misNoticiasData.length > 0
                    ? "💡 El método directo funciona, revisar parsing"
                    : "🚨 Problema más profundo - verificar conexión y red"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
