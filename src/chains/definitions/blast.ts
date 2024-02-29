import { defineChain } from '../../utils/chain/defineChain.js'

export const blast = /*#__PURE__*/ defineChain({
  id: 81457,
  name: 'Blast',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://blast.blockpi.network/v1/rpc/public'],
    },
  },
})
