import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const fluentTestnet = /*#__PURE__*/ Chain.from({
  id: 20_994,
  name: 'Fluent Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.testnet.fluent.xyz',
  },
  blockExplorers: {
    name: 'Fluent Testnet Explorer',
    url: 'https://testnet.fluentscan.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
