import * as Chain from '../../core/Chain.js'

export const lyra = /*#__PURE__*/ Chain.define({
  id: 957n,
  name: 'Lyra Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.lyra.finance'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lyra Explorer',
      url: 'https://explorer.lyra.finance',
      apiUrl: 'https://explorer.lyra.finance/api/v2',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1935198,
    },
  },
})
