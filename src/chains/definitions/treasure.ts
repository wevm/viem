import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const treasure = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 61_166,
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
