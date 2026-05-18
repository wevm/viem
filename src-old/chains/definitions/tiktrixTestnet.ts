import { defineChain } from '../../utils/chain/defineChain.js'

export const tiktrixTestnet = /*#__PURE__*/ defineChain({
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
