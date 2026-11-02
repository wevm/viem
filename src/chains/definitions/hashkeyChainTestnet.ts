import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hashkeyTestnet = /*#__PURE__*/ Chain.from({
  id: 133,
  name: 'HSKChain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey Platform Token',
    symbol: 'HSK',
  },
  rpcUrls: {
    http: 'https://testnet.hsk.xyz',
  },
  blockExplorers: {
    name: 'HSKChain Testnet explorer',
    url: 'https://testnet-explorer.hskchain.net',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
