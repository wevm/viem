import { defineChain } from '../../utils/chain/defineChain.js'

export const rootstock = /*#__PURE__*/ defineChain({
  id: 30,
  name: 'Rootstock Mainnet',
  network: 'rootstock',
  nativeCurrency: {
    decimals: 18,
    name: 'Rootstock Bitcoin',
    symbol: 'RBTC',
  },
  rpcUrls: {
    default: { http: ['https://public-node.rsk.co'] },
  },
  blockExplorers: {
    default: {
      name: 'RSK Explorer',
      url: 'https://explorer.rsk.co',
    },
  },
  ensTlds: ['.rsk'],
  contracts: {
    ensRegistry: {
      address: '0xcb868aeabd31e2b66f74e9a55cf064abb31a4ad5',
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 4249540,
    },
  },
})
