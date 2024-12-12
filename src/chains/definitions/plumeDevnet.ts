import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const plumeDevnet = /*#__PURE__*/ defineChain({
  id: 98_864,
  name: 'Plume Devnet',
  nativeCurrency: {
    name: 'Plume Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://test-rpc.plumenetwork.xyz'],
      webSocket: ['wss://test-rpc.plumenetwork.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://test-explorer.plumenetwork.xyz',
      apiUrl: 'https://test-explorer.plumenetwork.xyz/api',
    },
  },
  testnet: true,
  sourceId,
})
