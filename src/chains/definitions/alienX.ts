import { defineChain } from '../../utils/chain/defineChain.js'

export const alienx = /*#__PURE__*/ defineChain({
  id: 10241024,
  name: 'AlienX Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.alienxchain.io/http'] },
  },
  blockExplorers: {
    default: {
      name: 'AlienX Explorer',
      url: 'https://explorer.alienxchain.io',
    },
  },
  testnet: false,
})
