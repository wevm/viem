import { defineChain } from '../../utils/chain/defineChain.js'

export const icbNetwork = /*#__PURE__*/ defineChain({
  id: 73115,
  name: 'ICB Network',
  nativeCurrency: {
    decimals: 18,
    name: 'ICB Native Token',
    symbol: 'ICBX',
  },
  rpcUrls: {
    default: { http: ['https://rpc1-mainnet.icbnetwork.info'] },
  },
  blockExplorers: {
    default: {
      name: 'ICB Explorer',
      url: 'https://icbscan.io',
      apiUrl: 'https://icbscan.io/api',
    },
  },
  testnet: false,
})
