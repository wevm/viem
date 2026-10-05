import * as Chain from '../../core/Chain.js'

export const treasure = /*#__PURE__*/ Chain.from({
  id: 61_166,
  name: 'Treasure',
  nativeCurrency: {
    decimals: 18,
    name: 'MAGIC',
    symbol: 'MAGIC',
  },
  rpcUrls: {
    http: 'https://rpc.treasure.lol',
    ws: 'wss://rpc.treasure.lol/ws',
  },
  blockExplorers: {
    name: 'Treasure Block Explorer',
    url: 'https://treasurescan.io',
  },
  contracts: {
    multicall3: {
      address: '0x2e29fe39496a56856D8698bD43e1dF4D0CE6266a',
      blockCreated: 101,
    },
  },
  testnet: false,
})
