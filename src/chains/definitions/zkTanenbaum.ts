import { defineChain } from '../../utils/chain/defineChain.js'

export const zkTanenbaum = /*#__PURE__*/ defineChain({
  blockTime: 2_000,
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
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 477,
    },
  },
  testnet: true,
})
