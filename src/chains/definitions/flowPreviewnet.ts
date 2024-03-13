import { defineChain } from '../../utils/chain/defineChain.js'

export const flowPreviewnet = /*#__PURE__*/ defineChain({
  id: 646,
  name: 'FlowEVM Previewnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://previewnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Previewnet Explorer',
      url: 'https://previewnet.flowdiver.io',
    },
  },
})
