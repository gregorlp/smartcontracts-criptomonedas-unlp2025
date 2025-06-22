"use client"

import { useAccount, usePublicClient } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI, type Preview } from "@/lib/contract-config"
import { NewsCard } from "@/components/news-card"
import { Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { encodeFunctionData, decodeAbiParameters, parseAbiParameters } from "viem"

export function MyNews() {
  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const [previews, setPreviews] = useState<Preview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener mis noticias usando call manual
  const fetchMyNews = async () => {
    if (!publicClient || !address) return

    try {
      setIsLoading(true)
      setError(null)

      // Generar function data
      const functionData = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "obtenerPreviewsMisNoticias",
        args: [],
      })

      // Hacer call directo
      const result = await publicClient.call({
        to: CONTRACT_ADDRESS,
        data: functionData,
        account: address,
      })

      if (result.data && result.data !== "0x") {
        // Decodificar respuesta
        const abiTypes = parseAbiParameters("(uint256,address,string,string,string,uint256,uint256,string)[]")
        const decoded = decodeAbiParameters(abiTypes, result.data as `0x${string}`)

        if (decoded && decoded[0] && Array.isArray(decoded[0])) {
          const parsedPreviews: Preview[] = (decoded[0] as any[]).map((tuple: any) => ({
            id: BigInt(tuple[0]),
            autor: String(tuple[1]).toLowerCase(),
            titulo: String(tuple[2]),
            descripcion: String(tuple[3]),
            categoria: String(tuple[4]),
            promedio: BigInt(tuple[5]),
            cantidadVotos: BigInt(tuple[6]),
            hashContenido: String(tuple[7]),
          }))

          setPreviews(parsedPreviews)
        } else {
          setPreviews([])
        }
      } else {
        setPreviews([])
      }
    } catch (err: any) {
      setError(err.message)
      setPreviews([])
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar y cuando cambie la dirección
  useEffect(() => {
    if (isConnected && address) {
      fetchMyNews()
    }
  }, [isConnected, address, publicClient])

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Conecta tu wallet para ver tus noticias</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2 text-gray-600">Cargando tus noticias...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mis Noticias ({previews.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchMyNews} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "🔄"}
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-lg text-sm border border-red-200">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {previews.length === 0 && !error ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No tienes noticias publicadas</p>
            <p className="text-sm text-gray-500 mt-2">Ve a "Publicar Noticia" para crear tu primera noticia</p>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">Mostrando {previews.length} noticias publicadas</div>

          {previews.map((preview, index) => (
            <div key={`my-news-${preview.id.toString()}`} className="border-l-4 border-blue-500 pl-4">
              <div className="text-xs text-blue-600 mb-2">
                Noticia #{index + 1} - ID: {preview.id.toString()} - Promedio: {preview.promedio.toString()}/10 - Votos:{" "}
                {preview.cantidadVotos.toString()}
              </div>
              <NewsCard news={preview} showVoting={false} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}
