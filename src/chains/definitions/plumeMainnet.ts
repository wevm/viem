import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // ethereum

export const plumeMainnet = /*#__PURE__*/ defineChain({
  id: 98_866,
  name: 'Plume',
  nativeCurrency: {
    name: 'Plume',
    symbol: 'PLUME',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://phoenix-rpc.plumenetwork.xyz'],
      webSocket: ['wss://phoenix-rpc.plumenetwork.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://phoenix-explorer.plumenetwork.xyz',
      apiUrl: 'https://phoenix-explorer.plumenetwork.xyz/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 39_679,
    },
  },
  sourceId,
})
