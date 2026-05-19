import * as Chain from '../../core/Chain.js'

export const sanko = /*#__PURE__*/ Chain.define({
  id: 1996n,
  name: 'Sanko',
  nativeCurrency: { name: 'DMT', symbol: 'DMT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.sanko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sanko Explorer',
      url: 'https://explorer.sanko.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 37,
    },
  },
  testnet: false,
})
