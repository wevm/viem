import * as Chain from '../../core/Chain.js'

export const tiktrixTestnet = /*#__PURE__*/ Chain.from({
  id: 62092,
  name: 'TikTrix Testnet',
  nativeCurrency: {
    name: 'tTTX',
    symbol: 'tTTX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://tiktrix-rpc.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TikTrix Testnet Explorer',
      url: 'https://tiktrix.xyz',
    },
  },
  testnet: true,
})
