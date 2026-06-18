import * as Chain from '../../core/Chain.js'

export const mapProtocol = /*#__PURE__*/ Chain.from({
  id: 22776,
  name: 'MAP Protocol',
  nativeCurrency: {
    decimals: 18,
    name: 'MAPO',
    symbol: 'MAPO',
  },
  rpcUrls: {
    default: { http: ['https://rpc.maplabs.io'] },
  },
  blockExplorers: {
    default: {
      name: 'MAPO Scan',
      url: 'https://maposcan.io',
    },
  },
  testnet: false,
})
