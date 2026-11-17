import * as Chain from '../../core/Chain.js'

export const ultra = /*#__PURE__*/ Chain.from({
  id: 19991,
  name: 'Ultra EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Ultra Token',
    symbol: 'UOS',
  },
  rpcUrls: { http: 'https://evm.ultra.eosusa.io' },
  blockExplorers: {
    name: 'Ultra EVM Explorer',
    url: 'https://evmexplorer.ultra.io',
  },
})
