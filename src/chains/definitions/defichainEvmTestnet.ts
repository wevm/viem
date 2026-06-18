import * as Chain from '../../core/Chain.js'

export const defichainEvmTestnet = /*#__PURE__*/ Chain.from({
  id: 1131,
  name: 'DeFiChain EVM Testnet',
  nativeCurrency: {
    name: 'DeFiChain',
    symbol: 'DFI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://eth.testnet.ocean.jellyfishsdk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DeFiScan',
      url: 'https://meta.defiscan.live/?network=TestNet',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 156462,
    },
  },
  testnet: true,
})
