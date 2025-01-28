import { defineChain } from '../../utils/chain/defineChain.js'

export const ultra = /*#__PURE__*/ defineChain({
  id: 19991,
  name: 'Ultra EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Ultra Token',
    symbol: 'UOS',
  },
  rpcUrls: {
    default: { http: ['https://evm.ultra.eosusa.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Ultra EVM Explorer',
      url: 'https://evmexplorer.ultra.io',
    },
  },
})
