"use client"

import { useAccount, usePublicClient } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI, type Preview } from "@/lib/contract-config"
import { NewsCard } from "@/components/news-card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { encodeFunctionData, decodeAbiParameters, parseAbiParameters } from "viem"

export function NewsList() {
  const { isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [previews, setPreviews] = useState<Preview[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Función para obtener noticias generales usando call manual
  const fetchNews = async () => {
    if (!publicClient) return

    try {
      setIsLoading(true)

      const functionData = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "obtenerPreviewsNoticiasGenerales",
        args: [],
      })

      const result = await publicClient.call({
        to: CONTRACT_ADDRESS,
        data: functionData,
      })

      if (result.data && result.data !== "0x") {
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
    } catch (error) {
      console.error("Error obteniendo noticias:", error)
      setPreviews([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && publicClient) {
      fetchNews()
    }
  }, [isConnected, publicClient])

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Conecta tu wallet para ver las noticias</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (previews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay noticias publicadas aún</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Noticias Generales</h3>
        <Button variant="outline" size="sm" onClick={fetchNews} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "🔄"}
          Actualizar
        </Button>
      </div>
      {previews.map((preview) => (
        <NewsCard key={preview.id.toString()} news={preview} showVoting={true} onVoteSuccess={() => fetchNews()} />
      ))}
    </div>
  )
}
