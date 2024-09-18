import { defineChain } from '../../utils/chain/defineChain.js'

export const worldchain = /*#__PURE__*/ defineChain({
  id: 480,
  name: 'World Chain',
  network: 'worldchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] },
  },
  blockExplorers: {
    default: {
      name: 'World Chain Explorer',
      url: 'https://worldchain-mainnet.explorer.alchemy.com',
    },
  },
  testnet: false,
})
