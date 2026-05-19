import * as Chain from '../../core/Chain.js'

export const electroneum = /*#__PURE__*/ Chain.define({
  id: 52014n,
  name: 'Electroneum Mainnet',
  nativeCurrency: {
    name: 'ETN',
    symbol: 'ETN',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.electroneum.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Electroneum Block Explorer',
      url: 'https://blockexplorer.electroneum.com',
    },
  },
  testnet: false,
})
