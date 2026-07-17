import * as Chain from '../../core/Chain.js'

export const morph = /*#__PURE__*/ Chain.from({
  id: 2818,
  name: 'Morph',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://rpc.morphl2.io',
    ws: 'wss://rpc.morphl2.io:8443',
  },
  blockExplorers: {
    name: 'Morph Explorer',
    url: 'https://explorer.morphl2.io',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3654913,
    },
  },
  testnet: false,
})
