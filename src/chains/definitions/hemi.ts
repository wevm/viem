import { defineChain } from '../../utils/chain/defineChain.js'

export const hemi = /*#__PURE__*/ defineChain({
  id: 43111,
  name: 'Hemi',
  network: 'Hemi',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hemi.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.hemi.xyz',
    },
  },
  testnet: false,
})
