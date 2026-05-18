import { defineChain } from '../../utils/chain/defineChain.js'

export const near = /*#__PURE__*/ defineChain({
  id: 397,
  name: 'NEAR Protocol',
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: {
    default: { http: ['https://eth-rpc.mainnet.near.org'] },
  },
  blockExplorers: {
    default: {
      name: 'NEAR Explorer',
      url: 'https://eth-explorer.near.org',
    },
  },
  testnet: false,
})
