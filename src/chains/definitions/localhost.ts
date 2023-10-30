import { defineChain } from '../../utils/chain/defineChain.js'

export const localhost = /*#__PURE__*/ defineChain({
  id: 1_337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
})
