import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

/** ValueChain testnet. */
export const valuechainTestnet = /*#__PURE__*/ Chain.from({
  id: 138_565,
  name: 'ValueChain Testnet',
  blockTime: 2_000,
  nativeCurrency: { name: 'SOSO', symbol: 'SOSO', decimals: 18 },
  rpcUrls: {
    http: 'https://testnet.valuechain.xyz',
  },
  blockExplorers: {
    name: 'ValueChain Testnet Explorer',
    url: 'https://test-scan.valuechain.xyz',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
