import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const stable = /*#__PURE__*/ Chain.from({
  id: 988,
  name: 'Stable Mainnet',
  blockTime: 700,
  nativeCurrency: {
    name: 'USDT0',
    symbol: 'USDT0',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.stable.xyz',
    ws: 'wss://rpc.stable.xyz',
  },
  blockExplorers: {
    name: 'Stablescan',
    url: 'https://stablescan.xyz',
    apiUrl: 'https://api.etherscan.io/v2/api?chainid=988',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2423647,
    },
  },
  testnet: false,
})
