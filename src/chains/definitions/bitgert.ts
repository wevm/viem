import { defineChain } from '../../utils/chain/defineChain.js'

export const bitgert = /*#__PURE__*/ defineChain({
  id: 32520,
  name: 'Bitgert Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Brise',
    symbol: 'Brise',
  },
  rpcUrls: {
    default: { http: ['https://rpc-bitgert.icecreamswap.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Bitgert Scan',
      url: 'https://brisescan.com',
    },
  },
  testnet: false,
})
