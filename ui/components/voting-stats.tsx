"use client"

import { useAccount, usePublicClient } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { encodeFunctionData, decodeAbiParameters, parseAbiParameters } from "viem"

export function VotingStats() {
  const { isConnected, address } = useAccount()
  const publicClient = usePublicClient()
  const [myVotesCount, setMyVotesCount] = useState(0)
  const [totalNews, setTotalNews] = useState(0)
  const [totalVotes, setTotalVotes] = useState(0)

  // Función para obtener mis votaciones usando call manual
  const fetchMyVotesCount = async () => {
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

        if (decoded && decoded[0]) {
          setMyVotesCount((decoded[0] as any[]).length)
        }
      }
    } catch (error) {
      console.error("Error obteniendo mis votos:", error)
    }
  }

  // Función para obtener noticias generales usando call manual
  const fetchGeneralNews = async () => {
    if (!publicClient) return

    try {
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

        if (decoded && decoded[0]) {
          const newsArray = decoded[0] as any[]
          setTotalNews(newsArray.length)

          // Calcular total de votos
          const votes = newsArray.reduce((sum, news) => sum + Number(news[6]), 0) // cantidadVotos está en índice 6
          setTotalVotes(votes)
        }
      }
    } catch (error) {
      console.error("Error obteniendo noticias generales:", error)
    }
  }

  useEffect(() => {
    if (isConnected && publicClient) {
      fetchGeneralNews()
      if (address) {
        fetchMyVotesCount()
      }
    }
  }, [isConnected, address, publicClient])

  if (!isConnected) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mis Votos</CardTitle>
          <Star className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{myVotesCount}</div>
          <p className="text-xs text-muted-foreground">Noticias que has votado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Noticias</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNews}</div>
          <p className="text-xs text-muted-foreground">Noticias publicadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Votos</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVotes}</div>
          <p className="text-xs text-muted-foreground">Votos en la plataforma</p>
        </CardContent>
      </Card>
    </div>
  )
}
