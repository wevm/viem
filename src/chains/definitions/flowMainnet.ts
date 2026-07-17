import * as Chain from '../../core/Chain.js'

export const flowMainnet = /*#__PURE__*/ Chain.from({
  id: 747,
  name: 'Flow EVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    http: 'https://mainnet.evm.nodes.onflow.org',
  },
  blockExplorers: {
    name: 'Mainnet Explorer',
    url: 'https://evm.flowscan.io',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 6205,
    },
  },
  blockTime: 800,
})
