import { defineChain } from '../../utils/chain/defineChain.js'

export const storyTestnet = /*#__PURE__*/ defineChain({
  id: 1513,
  name: 'Story Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://rpc.partner.testnet.storyprotocol.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Story Testnet Explorer',
      url: 'https://explorer.testnet.storyprotocol.net',
    },
  },
  testnet: true,
})
