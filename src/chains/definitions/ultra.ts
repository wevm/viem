import * as Chain from '../../core/Chain.js'

export const ultra = /*#__PURE__*/ Chain.define({
  id: 19991n,
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
