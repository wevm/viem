import * as Chain from '../../core/Chain.js'

export const lumoz = /*#__PURE__*/ Chain.from({
  id: 96_370,
  name: 'Lumoz',
  nativeCurrency: {
    decimals: 18,
    name: 'Lumoz Token',
    symbol: 'MOZ',
  },
  rpcUrls: {
    http: 'https://rpc.lumoz.org',
  },
  blockExplorers: {
    name: 'Lumoz Scan',
    url: 'https://scan.lumoz.info',
  },
  testnet: false,
})
