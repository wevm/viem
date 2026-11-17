import * as Chain from '../../core/Chain.js'

export const birdlayer = /*#__PURE__*/ Chain.from({
  id: 53456,
  name: 'BirdLayer',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    http: ['https://rpc.birdlayer.xyz', 'https://rpc1.birdlayer.xyz'],
    ws: 'wss://rpc.birdlayer.xyz/ws',
  },
  blockExplorers: {
    name: 'BirdLayer Explorer',
    url: 'https://scan.birdlayer.xyz',
  },
})
