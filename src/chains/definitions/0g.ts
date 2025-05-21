import { defineChain } from '../../utils/chain/defineChain.js'

export const zeroG = /*#__PURE__*/ defineChain({
  id: 16_601,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G BlockChain Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
})
