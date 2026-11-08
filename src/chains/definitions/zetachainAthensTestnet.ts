import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const zetachainAthensTestnet = /*#__PURE__*/ Chain.from({
  id: 7001,
  name: 'ZetaChain Athens Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Zeta',
    symbol: 'aZETA',
  },
  rpcUrls: {
    http: 'https://zetachain-athens-evm.blockpi.network/v1/rpc/public',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2715217,
    },
  },
  blockExplorers: {
    name: 'ZetaScan',
    url: 'https://testnet.zetascan.com',
  },
  testnet: true,
})
