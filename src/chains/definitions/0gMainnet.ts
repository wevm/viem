import { defineChain } from '../../utils/chain/defineChain.js'

export const zeroGMainnet = /*#__PURE__*/ defineChain({
  id: 16_661,
  name: '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmrpc.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G BlockChain Explorer',
      url: 'https://chainscan.0g.ai',
    },
  },
  testnet: false,
})
