import * as Chain from '../../core/Chain.js'

export const dymension = /*#__PURE__*/ Chain.from({
  id: 1100,
  name: 'Dymension',
  nativeCurrency: {
    name: 'DYM',
    symbol: 'DYM',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://dymension-evm-rpc.publicnode.com',
    ws: 'wss://dymension-evm-rpc.publicnode.com',
  },
  blockExplorers: {
    name: 'Dym FYI',
    url: 'https://dym.fyi',
  },
  testnet: false,
})
