import { defineChain } from '../../utils/chain/defineChain.js'

export const bsc = /*#__PURE__*/ defineChain({
  id: 56,
  name: 'BNB Smart Chain',
  blockTime: 750,
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: { http: ['https://56.rpc.thirdweb.com'] },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://bscscan.com',
      apiUrl: 'https://api.bscscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 15921452,
    },
  },
})
