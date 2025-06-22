"use client"

import { useAccount, usePublicClient } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI, type Preview } from "@/lib/contract-config"
import { NewsCard } from "@/components/news-card"
import { Loader2, Vote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { encodeFunctionData, decodeAbiParameters, parseAbiParameters } from "viem"

export function MyVotes() {
  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const [previews, setPreviews] = useState<Preview[]>([])
  const [puntuaciones, setPuntuaciones] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener mis votaciones usando call manual
  const fetchMyVotes = async () => {
    if (!publicClient || !address) return

    try {
      setIsLoading(true)
      setError(null)

      // Generar function data para obtenerPreviewsMisVotaciones
      const functionData = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "obtenerPreviewsMisVotaciones",
        args: [],
      })

      // Hacer call directo
      const result = await publicClient.call({
        to: CONTRACT_ADDRESS,
        data: functionData,
        account: address,
      })

      if (result.data && result.data !== "0x") {
        // Decodificar respuesta - obtenerPreviewsMisVotaciones devuelve (Preview[], uint256[])
        const abiTypes = parseAbiParameters(
          "(uint256,address,string,string,string,uint256,uint256,string)[] previews, uint256[] puntuaciones",
        )
        const decoded = decodeAbiParameters(abiTypes, result.data as `0x${string}`)

        if (decoded && decoded[0] && decoded[1]) {
          // Parsear previews
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

          // Parsear puntuaciones
          const parsedPuntuaciones: number[] = (decoded[1] as any[]).map((score: any) => Number(score))

          setPreviews(parsedPreviews)
          setPuntuaciones(parsedPuntuaciones)
        } else {
          setPreviews([])
          setPuntuaciones([])
        }
      } else {
        setPreviews([])
        setPuntuaciones([])
      }
    } catch (err: any) {
      setError(err.message)
      setPreviews([])
      setPuntuaciones([])
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar y cuando cambie la dirección
  useEffect(() => {
    if (isConnected && address) {
      fetchMyVotes()
    }
  }, [isConnected, address, publicClient])

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Conecta tu wallet para ver tus votaciones</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2 text-gray-600">Cargando tus votaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mis Votaciones ({previews.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchMyVotes} disabled={isLoading}>
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
            <Vote className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No has votado en ninguna noticia aún</p>
            <p className="text-sm text-gray-500 mt-2">
              Ve a "Noticias Generales" para votar en las noticias de otros usuarios
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4">Mostrando {previews.length} votaciones realizadas</div>

          {previews.map((preview, index) => {
            const miPuntuacion = puntuaciones[index]

            return (
              <div key={`vote-${preview.id.toString()}-${index}`} className="border-l-4 border-purple-500 pl-4">
                <div className="text-xs text-purple-600 mb-2">
                  Votación #{index + 1} - ID: {preview.id.toString()} - Tu puntuación: {miPuntuacion}/10 - Promedio
                  actual: {preview.promedio.toString()}/10
                </div>
                <NewsCard news={preview} showVoting={false} myScore={miPuntuacion} />
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
