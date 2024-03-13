import { defineChain } from '../../utils/chain/defineChain.js'

export const flowMainnet = /*#__PURE__*/ defineChain({
  id: 747,
  name: 'FlowEVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mainnet Explorer',
      url: 'https://flowdiver.io',
    },
  },
})
