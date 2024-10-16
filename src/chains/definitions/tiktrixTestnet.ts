import { defineChain } from '../../utils/chain/defineChain.js'

export const tiktrixTestnet = /*#__PURE__*/ defineChain({
  id: 62092,
  name: 'TikTrix Network Testnet',
  nativeCurrency: {
    name: 'TikTrix Token',
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
      name: 'TikTrixScan',
      url: 'https://tiktrix.xyz',
    },
  },
  testnet: true,
})
