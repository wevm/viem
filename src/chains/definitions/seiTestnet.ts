import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const seiTestnet = /*#__PURE__*/ Chain.from({
  id: 1328,
  name: 'Sei Testnet',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    http: 'https://evm-rpc-testnet.sei-apis.com',
    ws: 'wss://evm-ws-testnet.sei-apis.com',
  },
  blockExplorers: {
    name: 'Seiscan',
    url: 'https://testnet.seiscan.io',
    apiUrl: 'https://api.etherscan.io/v2/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 98697651,
    },
  },
  testnet: true,
})
