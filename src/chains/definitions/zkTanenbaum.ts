import { defineChain } from '../../utils/chain/defineChain.js'

export const zkTanenbaum = /*#__PURE__*/ defineChain({
  id: 57057,
  name: 'zkTanenbaum Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Testnet Syscoin',
    symbol: 'TSYS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-zk.tanenbaum.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'zkTanenbaum Explorer',
      url: 'https://explorer-zk.tanenbaum.io',
      apiUrl: 'https://explorer-zk.tanenbaum.io/api',
    },
  },
  testnet: true,
})
