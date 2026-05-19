import * as Chain from '../../core/Chain.js'

export const hemiSepolia = /*#__PURE__*/ Chain.define({
  id: 743111n,
  name: 'Hemi Sepolia',
  network: 'Hemi Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.hemi.network/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hemi Sepolia explorer',
      url: 'https://testnet.explorer.hemi.xyz',
    },
  },
  testnet: true,
})
