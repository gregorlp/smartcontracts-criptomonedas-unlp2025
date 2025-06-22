"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CONTRACT_ADDRESS, CONTRACT_ABI, type NewsPreview } from "@/lib/contract-config"
import { StarRating } from "@/components/star-rating"
import { FilePreview } from "@/components/file-preview"
import { Loader2, User, Vote } from "lucide-react"

interface NewsCardProps {
  news: NewsPreview
  showVoting?: boolean
  myScore?: number
  onVoteSuccess?: () => void
}

export function NewsCard({ news, showVoting = false, myScore, onVoteSuccess }: NewsCardProps) {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [voteScore, setVoteScore] = useState("")

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleVote = async () => {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Debes conectar tu wallet primero",
        variant: "destructive",
      })
      return
    }

    const score = Number.parseInt(voteScore)
    if (isNaN(score) || score < 1 || score > 10) {
      toast({
        title: "Error",
        description: "La puntuación debe ser entre 1 y 10",
        variant: "destructive",
      })
      return
    }

    if (isMyNews) {
      toast({
        title: "Error",
        description: "No puedes votar tu propia noticia",
        variant: "destructive",
      })
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "validarNoticia",
        args: [news.id, BigInt(score)],
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar el voto",
        variant: "destructive",
      })
    }
  }

  // Manejar éxito del voto
  if (isSuccess && hash) {
    setVoteScore("")
    toast({
      title: "¡Voto registrado!",
      description: "Tu voto ha sido registrado exitosamente",
    })
    if (onVoteSuccess) {
      onVoteSuccess()
    }
    // Recargar para evitar loops
    window.location.reload()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isMyNews = address?.toLowerCase() === news.autor.toLowerCase()
  const averageScore = Number(news.promedio)
  const voteCount = Number(news.cantidadVotos)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{news.titulo}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{formatAddress(news.autor)}</span>
                {isMyNews && <Badge variant="secondary">Tuya</Badge>}
              </div>
              <Badge variant="outline">{news.categoria}</Badge>
            </div>
          </div>
          <div className="text-right">
            <StarRating rating={averageScore} size="md" />
            <p className="text-sm text-gray-600 mt-1">{voteCount} votos</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 mb-4">{news.descripcion}</p>

        {/* Previsualización del archivo */}
        {news.hashContenido && (
          <div className="mb-4">
            <FilePreview ipfsHash={news.hashContenido} fileName={`${news.titulo.slice(0, 30)}...`} />
          </div>
        )}

        {myScore && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                <strong>Tu puntuación:</strong> {myScore}/10
              </p>
              <StarRating rating={myScore} size="sm" />
            </div>
          </div>
        )}

        {showVoting && !isMyNews && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <label htmlFor={`vote-${news.id}`} className="text-sm font-medium text-gray-700">
                  Puntuar:
                </label>
                <select
                  id={`vote-${news.id}`}
                  value={voteScore}
                  onChange={(e) => setVoteScore(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isPending || isConfirming}
                >
                  <option value="">Selecciona</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <option key={score} value={score}>
                      {score}/10
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleVote}
                disabled={!voteScore || isPending || isConfirming}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Votando...
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4 mr-2" />
                    Votar
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 mb-2">
              Vota del 1 al 10 para ayudar a validar esta noticia (10 = más confiable)
            </div>

            {/* Estado de la votación */}
            {hash && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                <p className="text-yellow-800">
                  Voto enviado: {hash.slice(0, 8)}...{hash.slice(-6)}
                </p>
                {isConfirming && <p className="text-yellow-600">Confirmando...</p>}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
