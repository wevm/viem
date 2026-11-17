import * as Chain from '../../core/Chain.js'

export const electroneum = /*#__PURE__*/ Chain.from({
  id: 52014,
  name: 'Electroneum Mainnet',
  nativeCurrency: {
    name: 'ETN',
    symbol: 'ETN',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.electroneum.com',
  },
  blockExplorers: {
    name: 'Electroneum Block Explorer',
    url: 'https://blockexplorer.electroneum.com',
  },
  testnet: false,
})
