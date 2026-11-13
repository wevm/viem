import { defineChain } from '../../utils/chain/defineChain.js'

export const whitechain = /*#__PURE__*/ defineChain({
  id: 1875,
  name: 'Whitechain',
  nativeCurrency: {
    decimals: 18,
    name: 'WhiteBIT Coin',
    symbol: 'WBT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.whitechain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Whitechain Explorer',
      url: 'https://explorer.whitechain.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 25212237,
    },
  },
  testnet: false,
})
