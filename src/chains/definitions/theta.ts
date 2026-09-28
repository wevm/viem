import * as Chain from '../../core/Chain.js'

export const theta = /*#__PURE__*/ Chain.from({
  id: 361,
  name: 'Theta Mainnet',
  nativeCurrency: { name: 'TFUEL', symbol: 'TFUEL', decimals: 18 },
  rpcUrls: {
    http: 'https://eth-rpc-api.thetatoken.org/rpc',
  },
  blockExplorers: {
    name: 'Theta Explorer',
    url: 'https://explorer.thetatoken.org',
  },
  testnet: false,
})
