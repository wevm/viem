import { defineChain } from '../../utils/chain/defineChain.js'

export const bescHyperchain = /*#__PURE__*/ defineChain({
  id: 2_372,
  name: 'BESC Hyperchain',
  nativeCurrency: {
    name: 'BESC',
    symbol: 'BESC',
    decimals: 18,
  },
  blockTime: 3000, // 3 seconds
  rpcUrls: {
    default: {
      http: ['https://rpc.beschyperchain.com'],
      webSocket: ['wss://rpc.beschyperchain.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BESC Explorer',
      url: 'https://explorer.beschyperchain.com',
      apiUrl: 'https://explorer.beschyperchain.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xd20e59D42A283484C82167a819E2Ff5Ed2dC9857',
      blockCreated: 164313,
    },
  },
})
