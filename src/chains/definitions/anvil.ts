import * as Chain from '../../core/Chain.js'

export const anvil = /*#__PURE__*/ Chain.from({
  id: 31_337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'http://127.0.0.1:8545',
    ws: 'ws://127.0.0.1:8545',
  },
})
