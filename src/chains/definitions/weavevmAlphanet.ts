import { defineChain } from '../../utils/chain/defineChain.js'

export const weaveVMAlphanet = /*#__PURE__*/ defineChain({
  id: 9496,
  name: 'WeaveVM Alphanet',
  nativeCurrency: { name: 'Testnet WeaveVM', symbol: 'tWVM', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.wvm.dev'] },
  },
  blockExplorers: {
    default: {
      name: 'WeaveVM Alphanet Explorer',
      url: 'https://explorer.wvm.dev',
    },
  },
  testnet: true,
})
