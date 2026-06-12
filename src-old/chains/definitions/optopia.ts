import { defineChain } from '../../utils/chain/defineChain.js'

export const optopia = /*#__PURE__*/ defineChain({
  id: 62050,
  name: 'Optopia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-mainnet.optopia.ai'] },
  },
  blockExplorers: {
    default: {
      name: 'Optopia Explorer',
      url: 'https://scan.optopia.ai',
    },
  },
  testnet: false,
})
