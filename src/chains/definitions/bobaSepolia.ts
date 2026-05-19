import * as Chain from '../../core/Chain.js'

export const bobaSepolia = /*#__PURE__*/ Chain.define({
  id: 28882n,
  name: 'Boba Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://sepolia.boba.network'] },
  },
  blockExplorers: {
    default: {
      name: 'BOBAScan',
      url: 'https://testnet.bobascan.com',
    },
  },
  testnet: true,
})
