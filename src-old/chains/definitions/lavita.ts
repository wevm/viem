import { defineChain } from '../../utils/chain/defineChain.js'

export const lavita = /*#__PURE__*/ defineChain({
  id: 360890,
  name: 'LAVITA Mainnet',
  nativeCurrency: { name: 'vTFUEL', symbol: 'vTFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://tsub360890-eth-rpc.thetatoken.org/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'LAVITA Explorer',
      url: 'https://tsub360890-explorer.thetatoken.org',
    },
  },
  testnet: false,
})
