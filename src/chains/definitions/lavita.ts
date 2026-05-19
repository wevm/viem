import * as Chain from '../../core/Chain.js'

export const lavita = /*#__PURE__*/ Chain.define({
  id: 360890n,
  name: 'LAVITA Mainnet',
  nativeCurrency: { name: 'vTFUEL', symbol: 'vTFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://tsub360890-eth-rpc.thetatoken.org/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LAVITA Explorer',
      url: 'https://tsub360890-explorer.thetatoken.org',
    },
  },
  testnet: false,
})
