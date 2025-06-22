"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, FileText, ImageIcon, Video, Music, Download, Eye, EyeOff } from "lucide-react"

interface FilePreviewProps {
  ipfsHash: string
  fileName?: string
  className?: string
}

export function FilePreview({ ipfsHash, fileName, className = "" }: FilePreviewProps) {
  const [fileType, setFileType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [fileSize, setFileSize] = useState<string>("")

  const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`
  const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

  // Detectar tipo de archivo
  const detectFileType = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(ipfsUrl, { method: "HEAD" })
      const contentType = response.headers.get("content-type") || ""
      const contentLength = response.headers.get("content-length")

      setFileType(contentType)

      if (contentLength) {
        const sizeInMB = (Number.parseInt(contentLength) / 1024 / 1024).toFixed(2)
        setFileSize(`${sizeInMB} MB`)
      }
    } catch (err) {
      setError("Error al cargar información del archivo")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (ipfsHash) {
      detectFileType()
    }
  }, [ipfsHash])

  const getFileIcon = () => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    if (fileType.startsWith("video/")) return <Video className="w-4 h-4" />
    if (fileType.startsWith("audio/")) return <Music className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const getFileTypeLabel = () => {
    if (fileType.startsWith("image/")) return "Imagen"
    if (fileType.startsWith("video/")) return "Video"
    if (fileType.startsWith("audio/")) return "Audio"
    if (fileType.includes("pdf")) return "PDF"
    if (fileType.includes("text")) return "Texto"
    return "Archivo"
  }

  const canPreview = () => {
    return (
      fileType.startsWith("image/") ||
      fileType.startsWith("video/") ||
      fileType.startsWith("audio/") ||
      fileType.includes("pdf") ||
      fileType.startsWith("text/")
    )
  }

  const renderPreview = () => {
    if (!showPreview || !canPreview()) return null

    if (fileType.startsWith("image/")) {
      return (
        <div className="mt-4">
          <img
            src={pinataUrl || "/placeholder.svg"}
            alt="Previsualización"
            className="max-w-full max-h-96 rounded-lg shadow-md"
            onError={(e) => {
              e.currentTarget.src = ipfsUrl
            }}
          />
        </div>
      )
    }

    if (fileType.startsWith("video/")) {
      return (
        <div className="mt-4">
          <video controls className="max-w-full max-h-96 rounded-lg shadow-md" preload="metadata">
            <source src={pinataUrl} type={fileType} />
            <source src={ipfsUrl} type={fileType} />
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )
    }

    if (fileType.startsWith("audio/")) {
      return (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={pinataUrl} type={fileType} />
            <source src={ipfsUrl} type={fileType} />
            Tu navegador no soporta la reproducción de audio.
          </audio>
        </div>
      )
    }

    if (fileType.includes("pdf")) {
      return (
        <div className="mt-4">
          <iframe
            src={`${pinataUrl}#toolbar=0`}
            className="w-full h-96 rounded-lg border"
            title="Previsualización PDF"
          />
        </div>
      )
    }

    if (fileType.startsWith("text/")) {
      return (
        <div className="mt-4">
          <iframe
            src={pinataUrl}
            className="w-full h-64 rounded-lg border bg-white p-4"
            title="Previsualización de texto"
          />
        </div>
      )
    }

    return null
  }

  if (!ipfsHash) return null

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <div>
              <p className="font-medium text-sm">{fileName || "Archivo adjunto"}</p>
              <p className="text-xs text-gray-500">
                {isLoading ? "Cargando..." : `${getFileTypeLabel()}${fileSize ? ` • ${fileSize}` : ""}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {canPreview() && (
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? "Ocultar" : "Vista previa"}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={() => window.open(pinataUrl, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement("a")
                link.href = pinataUrl
                link.download = fileName || `archivo-${ipfsHash.slice(0, 8)}`
                link.click()
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}

        {renderPreview()}

        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-gray-500">
            <strong>IPFS Hash:</strong> {ipfsHash}
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => window.open(`https://ipfs.io/ipfs/${ipfsHash}`, "_blank")}
            >
              IPFS.io
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, "_blank")}
            >
              Pinata
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
