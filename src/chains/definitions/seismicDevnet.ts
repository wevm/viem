import * as Chain from '../../core/Chain.js'

export const seismicDevnet = /*#__PURE__*/ Chain.from({
  id: 5124,
  name: 'Seismic Devnet',
  nativeCurrency: { name: 'Seismic Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://node-2.seismicdev.net/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Seismic Devnet Explorer',
      url: 'https://explorer-2.seismicdev.net',
    },
  },
  testnet: true,
})
