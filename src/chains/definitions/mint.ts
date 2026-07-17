import * as Chain from '../../core/Chain.js'

export const mint = /*#__PURE__*/ Chain.from({
  id: 185,
  name: 'Mint Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.mintchain.io',
  },
  blockExplorers: {
    name: 'Mintchain explorer',
    url: 'https://explorer.mintchain.io',
  },
  testnet: false,
})
