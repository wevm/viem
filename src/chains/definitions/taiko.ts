import { defineChain } from '../../utils/chain/defineChain.js'

export const taiko = /*#__PURE__*/ defineChain({
  id: 167000,
  name: 'Taiko Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.taiko.xyz'],
      webSocket: ['wss://ws.mainnet.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Taikoscan',
      url: 'https://taikoscan.network',
      apiUrl: 'https://taikoscan.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcb2436774C3e191c85056d248EF4260ce5f27A9D',
    },
  },
})
