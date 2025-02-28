import { defineChain } from '../../utils/chain/defineChain.js'

export const viction = /*#__PURE__*/ defineChain({
  id: 88,
  name: 'Viction',
  nativeCurrency: { name: 'Viction', symbol: 'VIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.viction.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'VIC Scan',
      url: 'https://vicscan.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 87169904,
    },
  },
  testnet: false,
})
