import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const subtensorEvm = /*#__PURE__*/ Chain.from({
  id: 964,
  name: 'Subtensor EVM',
  nativeCurrency: {
    decimals: 18,
    name: 'TAO',
    symbol: 'TAO',
  },
  rpcUrls: {
    http: 'https://lite.chain.opentensor.ai',
  },
  blockExplorers: {
    name: 'Taostats EVM Explorer',
    url: 'https://evm.taostats.io',
    apiUrl: 'https://evm.taostats.io/api',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: false,
})
