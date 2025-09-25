import { defineChain } from '../../utils/chain/defineChain.js'

export const auroria = /*#__PURE__*/ defineChain({
  id: 205205,
  name: 'Auroria Testnet',
  network: 'auroria',
  nativeCurrency: {
    name: 'Auroria Stratis',
    symbol: 'tSTRAX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://auroria.rpc.stratisevm.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Auroria Testnet Explorer',
      url: 'https://auroria.explorer.stratisevm.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 46412,
    },
  },
  testnet: true,
})
