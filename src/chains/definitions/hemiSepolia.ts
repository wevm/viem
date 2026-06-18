import * as Chain from '../../core/Chain.js'

export const hemiSepolia = /*#__PURE__*/ Chain.from({
  id: 743111,
  name: 'Hemi Sepolia',
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
