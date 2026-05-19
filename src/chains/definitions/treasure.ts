import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../internal/zksync.js'

export const treasure = /*#__PURE__*/ Chain.define({
  ...chainConfig,
  id: 61_166n,
  name: 'Treasure',
  nativeCurrency: {
    decimals: 18,
    name: 'MAGIC',
    symbol: 'MAGIC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.treasure.lol'],
      webSocket: ['wss://rpc.treasure.lol/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Treasure Block Explorer',
      url: 'https://treasurescan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0x2e29fe39496a56856D8698bD43e1dF4D0CE6266a',
      blockCreated: 101,
    },
  },
  testnet: false,
})
