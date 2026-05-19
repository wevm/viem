import * as Chain from '../../core/Chain.js'

export const ultron = /*#__PURE__*/ Chain.define({
  id: 1231n,
  name: 'Ultron Mainnet',
  nativeCurrency: { name: 'ULX', symbol: 'ULX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://ultron-rpc.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ultron Scan',
      url: 'https://ulxscan.com',
    },
  },
  testnet: false,
})
