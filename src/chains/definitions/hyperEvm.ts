import { defineChain } from '../../utils/chain/defineChain.js'

export const hyperEvm = /*#__PURE__*/ defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
      webSocket: ['wss://hyperliquid.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperscan',
      url: 'https://www.hyperscan.com/',
    },
  },
})
