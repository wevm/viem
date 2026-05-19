import * as Chain from '../../core/Chain.js'

export const mint = /*#__PURE__*/ Chain.define({
  id: 185n,
  name: 'Mint Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mintchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mintchain explorer',
      url: 'https://explorer.mintchain.io',
    },
  },
  testnet: false,
})
