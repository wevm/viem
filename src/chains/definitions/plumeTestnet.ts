import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const plumeTestnet = /*#__PURE__*/ defineChain({
  id: 161_221_135,
  name: 'Plume Testnet (Legacy)',
  nativeCurrency: {
    name: 'Plume Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.plumenetwork.xyz/http'],
      webSocket: ['wss://testnet-rpc.plumenetwork.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://testnet-explorer.plumenetwork.xyz',
      apiUrl: 'https://testnet-explorer.plumenetwork.xyz/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 6_022_332,
    },
  },
  testnet: true,
  sourceId,
})
