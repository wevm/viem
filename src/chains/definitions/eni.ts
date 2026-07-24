import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const eni = /*#__PURE__*/ Chain.from({
  id: 173,
  name: 'ENI Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ENI',
    symbol: 'ENI',
  },
  rpcUrls: { http: 'https://rpc.eniac.network' },
  blockExplorers: {
    name: 'ENI Explorer',
    url: 'https://scan.eniac.network',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
