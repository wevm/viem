import * as Chain from '../../core/Chain.js'

export const hemi = /*#__PURE__*/ Chain.define({
  id: 43111n,
  name: 'Hemi',
  network: 'Hemi',
  blockTime: 12_000,
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
