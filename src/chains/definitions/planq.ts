import { defineChain } from '../../utils/chain/defineChain.js'

export const planq = /*#__PURE__*/ defineChain({
  id: 7070,
  name: 'Planq Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PLQ',
    symbol: 'PLQ',
  },
  rpcUrls: {
    default: { http: ['https://planq-rpc.nodies.app'] },
  },
  blockExplorers: {
    default: {
      name: 'Planq Explorer',
      url: 'https://evm.planq.network',
    },
  },
  testnet: false,
})
