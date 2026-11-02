import * as Chain from '../../core/Chain.js'

export const crymad = /*#__PURE__*/ Chain.from({
  id: 1475,
  name: 'CRYMAD Chain',
  nativeCurrency: {
    name: 'CryMadX',
    symbol: 'CMX-R',
    decimals: 18,
  },
  rpcUrls: { http: 'https://rpc.cmxofficial.com' },
  blockExplorers: {
    name: 'CRYMAD Chain Explorer',
    url: 'https://explorer.cmxofficial.com',
    apiUrl: 'https://explorer.cmxofficial.com/api/v2',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 834292,
    },
  },
})
