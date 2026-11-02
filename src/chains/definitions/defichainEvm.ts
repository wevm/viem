import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const defichainEvm = /*#__PURE__*/ Chain.from({
  id: 1130,
  name: 'DeFiChain EVM Mainnet',
  nativeCurrency: {
    name: 'DeFiChain',
    symbol: 'DFI',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://eth.mainnet.ocean.jellyfishsdk.com',
  },
  blockExplorers: {
    name: 'DeFiScan',
    url: 'https://meta.defiscan.live',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 137852,
    },
  },
})
