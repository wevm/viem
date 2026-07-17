import * as Chain from '../../core/Chain.js'

export const mizuhikiTestnetAwaji = /*#__PURE__*/ Chain.from({
  id: 6497,
  name: 'MIZUHIKI Testnet Awaji',
  nativeCurrency: { name: 'MIZU', symbol: 'MIZU', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.awaji.mizuhiki.io',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://awaji.blockscout.com',
    apiUrl: 'https://awaji.blockscout.com/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
