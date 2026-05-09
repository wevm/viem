import { defineChain } from '../../utils/chain/defineChain.js'

export const thetaTestnet = /*#__PURE__*/ defineChain({
  id: 365,
  name: 'Theta Testnet',
  nativeCurrency: { name: 'TFUEL', symbol: 'TFUEL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://eth-rpc-api-testnet.thetatoken.org/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Theta Explorer',
      url: 'https://testnet-explorer.thetatoken.org',
    },
  },
  testnet: true,
})
