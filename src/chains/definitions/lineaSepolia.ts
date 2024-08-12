import { chainConfig } from '../../linea/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const lineaSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 59_141,
  name: 'Linea Sepolia Testnet',
  nativeCurrency: { name: 'Linea Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.linea.build'],
      webSocket: ['wss://rpc.sepolia.linea.build'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.lineascan.build',
      apiUrl: 'https://api-sepolia.lineascan.build/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 227427,
    },
  },
  testnet: true,
})
