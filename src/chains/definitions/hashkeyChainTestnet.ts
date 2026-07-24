import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hashkeyTestnet = /*#__PURE__*/ Chain.from({
  id: 133,
  name: 'HashKey Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HashKey EcoPoints',
    symbol: 'HSK',
  },
  rpcUrls: {
    http: 'https://testnet.hsk.xyz',
  },
  blockExplorers: {
    name: 'HashKey Chain Testnet explorer',
    url: 'https://testnet-explorer.hsk.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
