import * as Chain from '../../core/Chain.js'

export const alienx = /*#__PURE__*/ Chain.from({
  id: 10241024,
  name: 'AlienX Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'https://rpc.alienxchain.io/http' },
  blockExplorers: {
    name: 'AlienX Explorer',
    url: 'https://explorer.alienxchain.io',
  },
  testnet: false,
})
