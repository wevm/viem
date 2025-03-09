import { defineChain } from '../../utils/chain/defineChain.js'

export const whitechainTestnet = /*#__PURE__*/ defineChain({
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
