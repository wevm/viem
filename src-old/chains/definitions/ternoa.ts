import { defineChain } from '../../utils/chain/defineChain.js'

export const ternoa = /*#__PURE__*/ defineChain({
  id: 752025,
  name: 'Ternoa',
  nativeCurrency: { name: 'Capsule Coin', symbol: 'CAPS', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet.zkevm.ternoa.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ternoa Explorer',
      url: 'https://explorer-mainnet.zkevm.ternoa.network',
    },
  },
  testnet: false,
})
