import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const telcoinTestnet = /*#__PURE__*/ Chain.from({
  id: 2017,
  name: 'Telcoin Adiri Testnet',
  nativeCurrency: { name: 'Telcoin', symbol: 'TEL', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.telcoin.network',
  },
  blockExplorers: {
    name: 'telscan',
    url: 'https://telscan.io',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
