"use client"

import type React from "react"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { uploadToIPFS, areCredentialsConfigured } from "@/lib/ipfs-client"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract-config"
import { Upload, Loader2 } from "lucide-react"
import { IPFSStatus } from "@/components/ipfs-status"
import { PinataSetupGuide } from "@/components/pinata-setup-guide"

export function PublishNews() {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const resetForm = () => {
    setFormData({ titulo: "", descripcion: "", categoria: "" })
    setFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      toast({
        title: "Error",
        description: "Debes conectar tu wallet primero",
        variant: "destructive",
      })
      return
    }

    if (!areCredentialsConfigured()) {
      toast({
        title: "Configuración requerida",
        description: "Las credenciales de Pinata no están configuradas.",
        variant: "destructive",
      })
      return
    }

    if (!file) {
      toast({
        title: "Error",
        description: "Debes seleccionar un archivo",
        variant: "destructive",
      })
      return
    }

    if (!formData.titulo || !formData.descripcion || !formData.categoria) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Subir archivo a IPFS via Pinata
      const cid = await uploadToIPFS(file)

      toast({
        title: "Archivo subido exitosamente a Pinata",
        description: `CID: ${cid}`,
      })

      // Publicar noticia en el contrato
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "publicarNoticia",
        args: [formData.titulo, formData.descripcion, formData.categoria, cid],
      })
    } catch (error: any) {
      toast({
        title: "Error al subir archivo",
        description: error.message || "Error desconocido al subir el archivo a Pinata",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Manejar éxito de la transacción
  if (isSuccess && hash) {
    toast({
      title: "¡Noticia publicada!",
      description: "Tu noticia ha sido publicada exitosamente",
    })
    resetForm()
    // Recargar la página para evitar loops
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {!areCredentialsConfigured() ? <PinataSetupGuide /> : <IPFSStatus />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Título de la noticia"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Descripción detallada de la noticia"
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoría</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="politica">Política</SelectItem>
              <SelectItem value="economia">Economía</SelectItem>
              <SelectItem value="tecnologia">Tecnología</SelectItem>
              <SelectItem value="deportes">Deportes</SelectItem>
              <SelectItem value="salud">Salud</SelectItem>
              <SelectItem value="educacion">Educación</SelectItem>
              <SelectItem value="entretenimiento">Entretenimiento</SelectItem>
              <SelectItem value="otros">Otros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="archivo">Archivo</Label>
          <div className="flex items-center gap-4">
            <Input
              id="archivo"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="flex-1"
              required
            />
            {file && (
              <span className="text-sm text-gray-600">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </div>
        </div>

        <Button type="submit" disabled={!isConnected || isUploading || isPending || isConfirming} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subiendo a Pinata...
            </>
          ) : isPending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Publicar Noticia
            </>
          )}
        </Button>

        {/* Estado de la transacción */}
        {hash && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Transacción enviada:</strong> {hash.slice(0, 10)}...{hash.slice(-8)}
            </p>
            {isConfirming && <p className="text-xs text-blue-600 mt-1">Esperando confirmación...</p>}
          </div>
        )}
      </form>
    </div>
  )
}
