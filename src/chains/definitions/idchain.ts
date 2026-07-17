import * as Chain from '../../core/Chain.js'

export const idchain = /*#__PURE__*/ Chain.from({
  id: 74,
  name: 'IDChain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EIDI',
    symbol: 'EIDI',
  },
  rpcUrls: {
    http: 'https://idchain.one/rpc',
    ws: 'wss://idchain.one/ws',
  },
  blockExplorers: {
    name: 'IDChain Explorer',
    url: 'https://explorer.idchain.one',
  },
  testnet: false,
})
