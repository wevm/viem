import { defineChain } from '../../utils/chain/defineChain.js'

export const fantom = /*#__PURE__*/ defineChain({
  id: 250,
  name: 'Fantom',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: {
    default: { http: ['https://250.rpc.thirdweb.com'] },
  },
  blockExplorers: {
    default: {
      name: 'FTMScan',
      url: 'https://ftmscan.com',
      apiUrl: 'https://api.ftmscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 33001987,
    },
  },
})
