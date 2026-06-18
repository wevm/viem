import * as Chain from '../../core/Chain.js'

export const radiusTestnet = /*#__PURE__*/ Chain.from({
  id: 72_344,
  name: 'Radius Test Network',
  nativeCurrency: { name: 'Radius USD', symbol: 'RUSD', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.radiustech.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Test Network Explorer',
      url: 'https://testnet.radiustech.xyz',
    },
  },
  testnet: true,
})
