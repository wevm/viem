import { defineChain } from '../../utils/chain/defineChain.js'

export const zeroG = /*#__PURE__*/ defineChain({
  id: 16_600,
  name: '0G Newton Testnet',
  nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G BlockChain Explorer',
      url: 'https://chainscan-newton.0g.ai',
    },
  },
  testnet: true,
})
