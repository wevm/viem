import { defineChain } from '../../utils/chain/defineChain.js'

export const theta = /*#__PURE__*/ defineChain({
  id: 361,
  name: 'Theta Mainnet',
  nativeCurrency: { name: 'TFUEL', symbol: 'TFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://eth-rpc-api.thetatoken.org/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Theta Explorer',
      url: 'https://explorer.thetatoken.org',
    },
  },
  testnet: false,
})
