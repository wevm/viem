import * as Chain from '../../core/Chain.js'

export const lumoz = /*#__PURE__*/ Chain.define({
  id: 96_370n,
  name: 'Lumoz',
  nativeCurrency: {
    decimals: 18,
    name: 'Lumoz Token',
    symbol: 'MOZ',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.lumoz.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lumoz Scan',
      url: 'https://scan.lumoz.info',
    },
  },
  testnet: false,
})
