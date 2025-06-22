"use client"

import { useAccount, usePublicClient } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI, type Preview } from "@/lib/contract-config"
import { NewsCard } from "@/components/news-card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { encodeFunctionData, decodeAbiParameters, parseAbiParameters } from "viem"

export function NewsList() {
  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const [previews, setPreviews] = useState<Preview[]>([])
  const [myVotes, setMyVotes] = useState<{ [newsId: string]: number }>({}) // Map de ID noticia -> puntuación
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

  // Función para obtener mis votaciones y crear el mapa de votos
  const fetchMyVotes = async () => {
    if (!publicClient || !address) return

    try {
      const functionData = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "obtenerPreviewsMisVotaciones",
        args: [],
      })

      const result = await publicClient.call({
        to: CONTRACT_ADDRESS,
        data: functionData,
        account: address,
      })

      if (result.data && result.data !== "0x") {
        const abiTypes = parseAbiParameters(
          "(uint256,address,string,string,string,uint256,uint256,string)[] previews, uint256[] puntuaciones",
        )
        const decoded = decodeAbiParameters(abiTypes, result.data as `0x${string}`)

        if (decoded && decoded[0] && decoded[1]) {
          const votedPreviews = decoded[0] as any[]
          const puntuaciones = decoded[1] as any[]

          // Crear mapa de ID noticia -> puntuación
          const votesMap: { [newsId: string]: number } = {}
          votedPreviews.forEach((preview, index) => {
            const newsId = String(preview[0]) // ID está en índice 0
            const puntuacion = Number(puntuaciones[index])
            votesMap[newsId] = puntuacion
          })

          setMyVotes(votesMap)
        }
      }
    } catch (error) {
      console.error("Error obteniendo mis votos:", error)
    }
  }

  useEffect(() => {
    if (isConnected && publicClient) {
      fetchNews()
      if (address) {
        fetchMyVotes()
      }
    }
  }, [isConnected, publicClient, address])

  const handleVoteSuccess = () => {
    // Actualizar tanto las noticias como mis votos después de votar
    fetchNews()
    fetchMyVotes()
  }

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
        <Button variant="outline" size="sm" onClick={() => handleVoteSuccess()} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "🔄"}
          Actualizar
        </Button>
      </div>
      {previews.map((preview) => {
        const newsId = preview.id.toString()
        const myVote = myVotes[newsId] // Puntuación que le di a esta noticia (undefined si no voté)

        return (
          <NewsCard
            key={preview.id.toString()}
            news={preview}
            showVoting={true}
            myVote={myVote} // Pasar mi voto si existe
            onVoteSuccess={handleVoteSuccess}
          />
        )
      })}
    </div>
  )
}
