import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const stableTestnet = /*#__PURE__*/ Chain.from({
  id: 2201,
  name: 'Stable Testnet',
  blockTime: 700,
  nativeCurrency: {
    name: 'USDT0',
    symbol: 'USDT0',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.testnet.stable.xyz',
    ws: 'wss://rpc.testnet.stable.xyz',
  },
  blockExplorers: {
    name: 'Stablescan',
    url: 'https://testnet.stablescan.xyz',
    apiUrl: 'https://api.etherscan.io/v2/api?chainid=2201',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 22364430,
    },
  },
  testnet: true,
})
