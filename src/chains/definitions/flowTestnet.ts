import { defineChain } from '../../utils/chain/defineChain.js'

export const flowTestnet = /*#__PURE__*/ defineChain({
  id: 545,
  name: 'FlowEVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Flow Diver',
      url: 'https://testnet.flowdiver.io',
    },
  },
})
