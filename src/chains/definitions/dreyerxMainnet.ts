import { defineChain } from '../../utils/chain/defineChain.js'

export const dreyerxMainnet = /*#__PURE__*/ defineChain({
  id: 23451,
  name: 'DreyerX Mainnet',
  nativeCurrency: {
    name: 'DreyerX',
    symbol: 'DRX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.dreyerx.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DreyerX Scan',
      url: 'https://scan.dreyerx.com',
    },
  },
})
