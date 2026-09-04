import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const hyperEvm = /*#__PURE__*/ Chain.from({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  blockExplorers: {
    name: 'HyperEVMScan',
    url: 'https://hyperevmscan.io',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13051,
    },
  },
  rpcUrls: {
    http: 'https://rpc.hyperliquid.xyz/evm',
  },
  testnet: false,
})
