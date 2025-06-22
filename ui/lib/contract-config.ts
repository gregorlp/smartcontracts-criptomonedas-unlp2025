import contractAbi from "@/abi-verificador-noticias.json"

export const CONTRACT_ADDRESS = "0x911fa74AB7d7Be2f8EbfA40B770b3c37665B9e1A" as const
export const CONTRACT_ABI = contractAbi.abi as const

// Tipo que coincide exactamente con el struct Preview del contrato
export type Preview = {
  id: bigint // uint
  autor: string // address
  titulo: string // string
  descripcion: string // string
  categoria: string // string
  promedio: bigint // uint
  cantidadVotos: bigint // uint
  hashContenido: string // string
}

// Alias para mantener compatibilidad
export type NewsPreview = Preview
