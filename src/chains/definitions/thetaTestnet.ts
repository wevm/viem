import * as Chain from '../../core/Chain.js'

export const thetaTestnet = /*#__PURE__*/ Chain.define({
  id: 365n,
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
