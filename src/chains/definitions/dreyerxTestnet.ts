import { defineChain } from '../utils.js'

export const dreyerxTestnet = /*#__PURE__*/ defineChain({
  id: 23452,
  name: 'DreyerX Testnet',
  nativeCurrency: {
    name: 'DreyerX',
    symbol: 'DRX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://testnet-rpc.dreyerx.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DreyerX Testnet Scan',
      url: 'https://testnet-scan.dreyerx.com',
    },
  },
  testnet: true,
})
