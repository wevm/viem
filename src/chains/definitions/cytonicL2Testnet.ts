import { defineChain } from '../../utils/chain/defineChain.js'

export const cytonicL2Testnet = /*#__PURE__*/ defineChain({
  id: 52_226,
  name: 'Cytonic L2 Testnet',
  nativeCurrency: { name: 'Cytonic', symbol: 'CCC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://rpc.evm.testnet.cytonic.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.evm.testnet.cytonic.com',
    },
  },
  testnet: true,
})
