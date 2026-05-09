import { defineChain } from '../../utils/chain/defineChain.js'

export const humanode = /*#__PURE__*/ defineChain({
  id: 5234,
  name: 'Humanode',
  nativeCurrency: { name: 'HMND', symbol: 'HMND', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://explorer-rpc-http.mainnet.stages.humanode.io'],
      webSocket: ['wss://explorer-rpc-ws.mainnet.stages.humanode.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Subscan',
      url: 'https://humanode.subscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 4_413_097,
    },
  },
})
