import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const zetachain = /*#__PURE__*/ Chain.from({
  id: 7000,
  name: 'ZetaChain',
  nativeCurrency: {
    decimals: 18,
    name: 'Zeta',
    symbol: 'ZETA',
  },
  rpcUrls: {
    http: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1632781,
    },
  },
  blockExplorers: {
    name: 'ZetaScan',
    url: 'https://zetascan.com',
  },
  testnet: false,
})
