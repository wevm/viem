import * as Chain from '../../core/Chain.js'

export const defichainEvm = /*#__PURE__*/ Chain.from({
  id: 1130,
  name: 'DeFiChain EVM Mainnet',
  nativeCurrency: {
    name: 'DeFiChain',
    symbol: 'DFI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://eth.mainnet.ocean.jellyfishsdk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DeFiScan',
      url: 'https://meta.defiscan.live',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 137852,
    },
  },
})
