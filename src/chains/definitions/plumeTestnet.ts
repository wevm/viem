import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const plumeTestnet = /*#__PURE__*/ defineChain({
  id: 161_221_135,
  name: 'Plume Testnet',
  nativeCurrency: {
    name: 'Plume Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://plume-testnet.rpc.caldera.xyz/http'],
      webSocket: ['wss://plume-testnet.rpc.caldera.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://plume-testnet.explorer.caldera.xyz',
      apiUrl: 'https://plume-testnet.explorer.caldera.xyz/api',
    },
  },
  testnet: true,
  sourceId,
})
