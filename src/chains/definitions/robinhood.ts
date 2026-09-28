import * as Contracts from '../../core/internal/contracts.js'
import * as Chain from '../../core/Chain.js'

export const robinhood = /*#__PURE__*/ Chain.from({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 100,
  rpcUrls: {
    http: [
      'https://rpc.mainnet.chain.robinhood.com',
      'https://rpc.ordofi.network',
    ],
    ws: ['wss://rpc.ordofi.network'],
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://robinhoodchain.blockscout.com',
    apiUrl: 'https://robinhoodchain.blockscout.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
