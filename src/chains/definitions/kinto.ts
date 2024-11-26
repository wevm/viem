import { defineChain } from '../../utils/chain/defineChain.js'

export const kinto = /*#__PURE__*/ defineChain({
  id: 7887,
  name: 'Kinto Mainnet',
  network: 'Kinto Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.kinto.xyz/http'] },
  },
  blockExplorers: {
    default: {
      name: 'Kinto Explorer',
      url: 'https://explorer.kinto.xyz',
    },
  },
  testnet: false,
})
