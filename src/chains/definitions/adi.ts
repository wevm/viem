import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const adi = /*#__PURE__*/ Chain.from({
  id: 36900,
  name: 'ADI_Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'ADI',
    symbol: 'ADI',
  },
  rpcUrls: {
    http: 'https://rpc.adifoundation.ai',
  },
  blockExplorers: {
    name: 'ADI Explorer',
    url: 'https://explorer.adifoundation.ai',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
