import * as Chain from '../../core/Chain.js'

export const birdlayer = /*#__PURE__*/ Chain.define({
  id: 53456n,
  name: 'BirdLayer',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: {
      http: ['https://rpc.birdlayer.xyz', 'https://rpc1.birdlayer.xyz'],
      webSocket: ['wss://rpc.birdlayer.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BirdLayer Explorer',
      url: 'https://scan.birdlayer.xyz',
    },
  },
})
