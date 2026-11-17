import * as Chain from '../../core/Chain.js'

export const thetaTestnet = /*#__PURE__*/ Chain.from({
  id: 365,
  name: 'Theta Testnet',
  nativeCurrency: { name: 'TFUEL', symbol: 'TFUEL', decimals: 18 },
  rpcUrls: {
    http: 'https://eth-rpc-api-testnet.thetatoken.org/rpc',
  },
  blockExplorers: {
    name: 'Theta Explorer',
    url: 'https://testnet-explorer.thetatoken.org',
  },
  testnet: true,
})
