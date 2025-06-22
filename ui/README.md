# 📰 Verificador de Noticias - DApp Descentralizada

Una plataforma descentralizada construida en **React/Next.js** para publicar, validar y verificar noticias utilizando **blockchain** (Sepolia) e **IPFS** para almacenamiento distribuido.

## 🚀 Características Principales

- ✅ **Publicación descentralizada** de noticias con archivos adjuntos
- 🗳️ **Sistema de votación** comunitario (1-10 puntos)
- 🔗 **Integración con MetaMask** para autenticación Web3
- 📁 **Almacenamiento IPFS** via Pinata para archivos
- 📱 **Responsive design** compatible con móviles
- ⭐ **Sistema de calificaciones** con estrellas
- 🔍 **Previsualización de archivos** (imágenes, videos, PDFs, etc.)

---

## 🛠️ Stack Tecnológico

### **Frontend & Framework**
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI modernos

### **Web3 & Blockchain**
- **Wagmi v2** - Hooks React para Ethereum
- **Viem** - Cliente TypeScript para Ethereum
- **MetaMask** - Wallet connector principal
- **Sepolia Testnet** - Red de pruebas Ethereum

### **Almacenamiento Descentralizado**
- **IPFS** - Sistema de archivos distribuido
- **Pinata** - Gateway y pinning service para IPFS

### **Estado & Queries**
- **TanStack Query** - Gestión de estado servidor
- **React Hooks** - Estado local de componentes

---

## 🔗 Conexión con MetaMask

### **Configuración Wagmi**

La aplicación utiliza **Wagmi v2** como abstracción principal para interactuar con MetaMask:

\`\`\`typescript
// lib/wagmi-config.ts
import { createConfig, http } from "wagmi"
import { sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      target: "metaMask", // Específicamente MetaMask
    }),
  ],
  transports: {
    [sepolia.id]: http(), // RPC público de Sepolia
  },
  ssr: false, // Importante para Vercel deployment
})
\`\`\`

### **Hooks de Conexión**

\`\`\`typescript
// Detectar estado de conexión
const { address, isConnected } = useAccount()

// Conectar wallet
const { connect, connectors } = useConnect()

// Desconectar wallet
const { disconnect } = useDisconnect()

// Verificar red correcta
const chainId = useChainId()
const { switchChain } = useSwitchChain()
\`\`\`

### **Detección de Dispositivos**

La app detecta automáticamente si estás en:
- **Desktop**: Conecta directamente con MetaMask extension
- **Mobile**: Guía para usar MetaMask Mobile browser

\`\`\`typescript
// Detección de móvil
const isMobile = window.innerWidth < 768 || 
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

// Detección de MetaMask
const hasMetaMask = typeof window !== "undefined" && !!window.ethereum?.isMetaMask
\`\`\`

---

## 📋 Conexión con Smart Contract

### **Configuración del Contrato**

\`\`\`typescript
// lib/contract-config.ts
export const CONTRACT_ADDRESS = "0x911fa74AB7d7Be2f8EbfA40B770b3c37665B9e1A"
export const CONTRACT_ABI = [...] // ABI completo del contrato

// Tipo TypeScript que coincide con el struct del contrato
export type Preview = {
  id: bigint
  autor: string
  titulo: string
  descripcion: string
  categoria: string
  promedio: bigint
  cantidadVotos: bigint
  hashContenido: string
}
\`\`\`

### **Operaciones de Lectura**

Utilizamos **useReadContract** para consultas:

\`\`\`typescript
// Leer noticias generales
const { data: allNews } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: "obtenerPreviewsNoticiasGenerales",
  query: { enabled: isConnected },
})
\`\`\`

### **Operaciones de Escritura**

Para transacciones utilizamos **useWriteContract**:

\`\`\`typescript
// Publicar noticia
const { writeContract, data: hash, isPending } = useWriteContract()

const handlePublish = () => {
  writeContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "publicarNoticia",
    args: [titulo, descripcion, categoria, ipfsHash],
  })
}

// Esperar confirmación
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash,
})
\`\`\`

### **Llamadas Manuales (Fallback)**

Para casos complejos, usamos llamadas directas con **viem**:

\`\`\`typescript
// Call manual para decodificación personalizada
const publicClient = usePublicClient()

const fetchData = async () => {
  const functionData = encodeFunctionData({
    abi: CONTRACT_ABI,
    functionName: "obtenerPreviewsMisNoticias",
    args: [],
  })

  const result = await publicClient.call({
    to: CONTRACT_ADDRESS,
    data: functionData,
    account: address,
  })

  // Decodificar respuesta manualmente
  const decoded = decodeAbiParameters(abiTypes, result.data)
}
\`\`\`

---

## 📁 Subida de Archivos a IPFS

### **Configuración de Pinata**

Pinata actúa como nuestro gateway y servicio de pinning para IPFS:

\`\`\`typescript
// lib/ipfs-client.ts
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT

export const ipfsClient = create({
  host: "api.pinata.cloud",
  port: 443,
  protocol: "https",
  headers: {
    authorization: `Bearer ${PINATA_JWT}`,
  },
})
\`\`\`

### **Proceso de Subida**

\`\`\`typescript
export async function uploadToIPFS(file: File): Promise<string> {
  // 1. Verificar credenciales
  if (!areCredentialsConfigured()) {
    throw new Error("Credenciales de Pinata no configuradas")
  }

  // 2. Preparar FormData
  const formData = new FormData()
  formData.append("file", file)
  
  // 3. Metadata para Pinata
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedBy: "VerificadorNoticias",
      timestamp: new Date().toISOString(),
    },
  })
  formData.append("pinataMetadata", metadata)

  // 4. Opciones de IPFS
  const options = JSON.stringify({
    cidVersion: 1, // Usar CIDv1
  })
  formData.append("pinataOptions", options)

  // 5. Subir a Pinata
  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  })

  const result = await response.json()
  return result.IpfsHash // Retorna el CID de IPFS
}
\`\`\`

### **Configuración de Variables de Entorno**

\`\`\`bash
# .env.local
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### **Previsualización de Archivos**

La app puede previsualizar diferentes tipos de archivos desde IPFS:

\`\`\`typescript
// URLs de acceso a archivos IPFS
const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`
const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

// Detección automática de tipo de archivo
const detectFileType = async () => {
  const response = await fetch(ipfsUrl, { method: "HEAD" })
  const contentType = response.headers.get("content-type")
  setFileType(contentType)
}

// Renderizado según tipo
if (fileType.startsWith("image/")) {
  return <img src={pinataUrl || "/placeholder.svg"} alt="Preview" />
} else if (fileType.startsWith("video/")) {
  return <video controls src={pinataUrl} />
} else if (fileType.includes("pdf")) {
  return <iframe src={pinataUrl} />
}
\`\`\`

---

## 🔧 Configuración del Proyecto

### **1. Clonar e Instalar**

\`\`\`bash
git clone <repository-url>
cd verificador-noticias
npm install
\`\`\`

### **2. Configurar Variables de Entorno**

\`\`\`bash
# .env.local
NEXT_PUBLIC_PINATA_JWT=tu_jwt_token_de_pinata
\`\`\`

### **3. Obtener JWT de Pinata**

1. Ve a [pinata.cloud](https://pinata.cloud) y crea una cuenta
2. Ve a **API Keys** en tu dashboard
3. Crea una nueva API Key con permisos `pinFileToIPFS`
4. Copia el JWT token generado

### **4. Ejecutar en Desarrollo**

\`\`\`bash
npm run dev
\`\`\`

### **5. Configurar MetaMask**

1. Instala MetaMask en tu navegador
2. Cambia a la red **Sepolia Testnet**
3. Obtén ETH de prueba desde [sepoliafaucet.com](https://sepoliafaucet.com)

---

## 📱 Uso en Móviles

### **Método Recomendado**
1. Instala **MetaMask Mobile**
2. Abre MetaMask app
3. Ve a la pestaña **"Browser"**
4. Navega a la URL de la aplicación
5. Conecta tu wallet normalmente

### **Método Alternativo**
- Usa el navegador móvil normal
- La app detectará automáticamente el dispositivo
- Seguir las instrucciones en pantalla

---

## 🏗️ Arquitectura del Sistema

\`\`\`
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart Contract │    │      IPFS       │
│   (Next.js)     │◄──►│   (Sepolia)      │    │   (Pinata)      │
│                 │    │                  │    │                 │
│ • React/TS      │    │ • Solidity       │    │ • File Storage  │
│ • Wagmi/Viem    │    │ • News Storage   │    │ • Distributed   │
│ • TailwindCSS   │    │ • Voting System  │    │ • Permanent     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │    MetaMask      │
                    │   (Web3 Wallet)  │
                    │                  │
                    │ • Authentication │
                    │ • Transactions   │
                    │ • Account Mgmt   │
                    └──────────────────┘
\`\`\`

---

## 🔍 Funcionalidades Principales

### **📝 Publicar Noticias**
1. Conectar MetaMask
2. Llenar formulario (título, descripción, categoría)
3. Subir archivo a IPFS via Pinata
4. Enviar transacción al smart contract
5. Esperar confirmación en blockchain

### **🗳️ Votar Noticias**
1. Ver noticias en "Noticias Generales"
2. Seleccionar puntuación (1-10)
3. Enviar voto al smart contract
4. Sistema previene votos duplicados
5. Actualización automática de promedios

### **📊 Ver Estadísticas**
- **Mis Noticias**: Noticias que publiqué
- **Mis Votaciones**: Noticias que voté con mi puntuación
- **Estadísticas**: Contadores generales de la plataforma

---

## 🚀 Deployment

### **Vercel (Recomendado)**

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel dashboard
# NEXT_PUBLIC_PINATA_JWT=tu_jwt_token
\`\`\`

### **Configuración Next.js para Producción**

\`\`\`javascript
// next.config.mjs
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding')
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, net: false, tls: false, crypto: false,
    }
    return config
  },
  transpilePackages: ['wagmi', 'viem', '@tanstack/react-query'],
}
\`\`\`

---

## 🐛 Troubleshooting

### **Problemas Comunes**

**❌ "MetaMask no detectado"**
- Instala MetaMask extension/app
- Actualiza tu navegador
- En móvil: usa MetaMask browser

**❌ "Red incorrecta"**
- Cambia a Sepolia en MetaMask
- Verifica que tengas ETH de prueba

**❌ "Error de Pinata"**
- Verifica tu JWT token
- Confirma permisos de API Key
- Revisa variables de entorno

**❌ "Transacción fallida"**
- Verifica saldo de ETH
- Aumenta gas limit
- Espera confirmación de red

### **Logs de Debug**

La aplicación incluye componentes de debug:
- `<SimpleContractTest />` - Test rápido de conexiones
- `<NetworkChecker />` - Verificación de red
- `<ContractDebug />` - Debug detallado del contrato

---

## 📚 Recursos Adicionales

- **Wagmi Docs**: [wagmi.sh](https://wagmi.sh)
- **Viem Docs**: [viem.sh](https://viem.sh)
- **Pinata Docs**: [docs.pinata.cloud](https://docs.pinata.cloud)
- **IPFS Docs**: [docs.ipfs.tech](https://docs.ipfs.tech)
- **MetaMask Docs**: [docs.metamask.io](https://docs.metamask.io)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🙏 Agradecimientos

- **Wagmi Team** - Por los excelentes hooks de React para Ethereum
- **Pinata** - Por el servicio confiable de IPFS
- **Vercel** - Por el hosting y deployment
- **shadcn/ui** - Por los componentes UI modernos
- **Ethereum Foundation** - Por la infraestructura blockchain

---

**🔗 Links Útiles:**
- [Demo Live](https://tu-app.vercel.app)
- [Smart Contract en Etherscan](https://sepolia.etherscan.io/address/0x911fa74AB7d7Be2f8EbfA40B770b3c37665B9e1A)
- [Documentación Técnica](./docs/)

---

*Construido con ❤️ para la descentralización de la información*
