"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Cargar componentes dinámicamente para evitar problemas de SSR
const WagmiProvider = dynamic(() => import("wagmi").then((mod) => ({ default: mod.WagmiProvider })), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  ),
})

const QueryClientProvider = dynamic(
  () => import("@tanstack/react-query").then((mod) => ({ default: mod.QueryClientProvider })),
  { ssr: false },
)

const QueryClient = dynamic(() => import("@tanstack/react-query").then((mod) => ({ default: mod.QueryClient })), {
  ssr: false,
})

// Componentes de la aplicación
const ConnectWallet = dynamic(
  () => import("@/components/connect-wallet").then((mod) => ({ default: mod.ConnectWallet })),
  {
    ssr: false,
  },
)

const PublishNews = dynamic(() => import("@/components/publish-news").then((mod) => ({ default: mod.PublishNews })), {
  ssr: false,
})

const NewsList = dynamic(() => import("@/components/news-list").then((mod) => ({ default: mod.NewsList })), {
  ssr: false,
})

const MyNews = dynamic(() => import("@/components/my-news").then((mod) => ({ default: mod.MyNews })), {
  ssr: false,
})

const MyVotes = dynamic(() => import("@/components/my-votes").then((mod) => ({ default: mod.MyVotes })), {
  ssr: false,
})

const NetworkChecker = dynamic(
  () => import("@/components/network-checker").then((mod) => ({ default: mod.NetworkChecker })),
  {
    ssr: false,
  },
)

const VotingStats = dynamic(() => import("@/components/voting-stats").then((mod) => ({ default: mod.VotingStats })), {
  ssr: false,
})

// Importaciones estáticas para componentes UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { config } from "@/lib/wagmi-config"
import { useAccount } from "wagmi"
import { QueryClient as QueryClientClass } from "@tanstack/react-query"
import { useState, useEffect } from "react"

// Crear QueryClient en el cliente
let queryClient: QueryClientClass

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClientClass()
  }
  return queryClient
}

function AppContent() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">Verificador de Noticias</h1>
          <p className="text-center text-gray-600 mb-6">Plataforma descentralizada para publicar y validar noticias</p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </div>

        {!isConnected && (
          <Alert className="mb-8 max-w-2xl mx-auto">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Para móviles:</strong> Si tienes problemas conectando, abre esta página directamente en el
              navegador integrado de MetaMask Mobile para la mejor experiencia.
            </AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <>
            <NetworkChecker />
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Noticias Generales</TabsTrigger>
                <TabsTrigger value="publish">Publicar Noticia</TabsTrigger>
                <TabsTrigger value="my-news">Mis Noticias</TabsTrigger>
                <TabsTrigger value="my-votes">Mis Votaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Todas las Noticias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VotingStats />
                    <NewsList />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="publish" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Publicar Nueva Noticia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PublishNews />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="my-news" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Noticias Publicadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MyNews />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="my-votes" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Votaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MyVotes />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <Toaster />
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={getQueryClient()}>
        <AppContent />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
