import * as Chain from '../../core/Chain.js'

export const whitechainTestnet = /*#__PURE__*/ Chain.from({
  testnet: true,
  name: 'Whitechain Testnet',
  blockExplorers: {
    default: {
      name: 'Whitechain Explorer',
      url: 'https://testnet.whitechain.io',
    },
  },
  id: 2625,
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.whitechain.io'],
    },
  },
  nativeCurrency: {
    decimals: 18,
    name: 'WhiteBIT Coin',
    symbol: 'WBT',
  },
})
