import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // ethereum

export const plume = /*#__PURE__*/ defineChain({
  id: 98_865,
  name: 'Plume (Legacy)',
  nativeCurrency: {
    name: 'Plume Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.plumenetwork.xyz'],
      webSocket: ['wss://rpc.plumenetwork.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.plumenetwork.xyz',
      apiUrl: 'https://explorer.plumenetwork.xyz/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 48_577,
    },
  },
  sourceId,
})
