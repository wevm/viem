import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const telosTestnet = /*#__PURE__*/ Chain.from({
  id: 41,
  name: 'Telos',
  nativeCurrency: {
    decimals: 18,
    name: 'Telos',
    symbol: 'TLOS',
  },
  rpcUrls: { http: 'https://rpc.testnet.telos.net' },
  blockExplorers: {
    name: 'Teloscan (testnet)',
    url: 'https://testnet.teloscan.io/',
  },
  contracts: {
    create2: Contracts.create2,
  },
  testnet: true,
})
