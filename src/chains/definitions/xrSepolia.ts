import * as Chain from '../../core/Chain.js'

export const xrSepolia = /*#__PURE__*/ Chain.from({
  id: 2730,
  name: 'XR Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'tXR',
    symbol: 'tXR',
  },
  rpcUrls: {
    default: { http: ['https://xr-sepolia-testnet.rpc.caldera.xyz/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://xr-sepolia-testnet.explorer.caldera.xyz',
    },
  },
  testnet: true,
})
