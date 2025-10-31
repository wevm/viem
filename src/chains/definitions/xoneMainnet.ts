import { defineChain } from '../../utils/chain/defineChain.js'

export const xoneMiannet = /*#__PURE__*/ defineChain({
  id: 3721,
  name: 'Xone Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XOC',
    symbol: 'XOC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xone.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Xone Mainnet Explorer',
      url: 'https://xonescan.com',
      apiUrl: 'http://api.xonescan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 16456390,
    },
  },
  testnet: false,
})
