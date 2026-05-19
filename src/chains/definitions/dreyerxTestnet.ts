import * as Chain from '../../core/Chain.js'

export const dreyerxTestnet = /*#__PURE__*/ Chain.define({
  id: 23452n,
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
