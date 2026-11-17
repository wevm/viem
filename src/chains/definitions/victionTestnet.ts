import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const victionTestnet = /*#__PURE__*/ Chain.from({
  id: 89,
  name: 'Viction Testnet',
  nativeCurrency: { name: 'Viction', symbol: 'VIC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-testnet.viction.xyz',
  },
  blockExplorers: {
    name: 'VIC Scan',
    url: 'https://testnet.vicscan.xyz',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 12170179,
    },
  },
  testnet: true,
})
