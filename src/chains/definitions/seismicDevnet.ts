import { defineChain } from '../../utils/chain/defineChain.js'

export const seismicTestnet = /*#__PURE__*/ defineChain({
  id: 5124,
  name: 'Seismic Testnet',
  nativeCurrency: { name: 'Seismic Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://gcp-2.seismictest.net/rpc'],
      webSocket: ['wss://gcp-2.seismictest.net/ws']
    },
  },
  blockExplorers: {
    default: {
      name: 'Seismic Testnet Explorer',
      url: 'https://seismic-testnet.socialscan.io',
    },
  },
  testnet: true,
})

export const seismicDevnet = seismicTestnet
