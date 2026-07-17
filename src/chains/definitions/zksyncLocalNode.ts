import * as Chain from '../../core/Chain.js'

export const zksyncLocalNode = /*#__PURE__*/ Chain.from({
  id: 270,
  name: 'ZKsync CLI Local Node',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'http://localhost:3050',
  },
  testnet: true,
})
