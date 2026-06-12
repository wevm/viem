import { defineChain } from '../../utils/chain/defineChain.js'

export const citreaTestnet = /*#__PURE__*/ defineChain({
  id: 5115,
  name: 'Citrea Testnet',
  nativeCurrency: { name: 'cBTC', symbol: 'cBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.citrea.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Citrea Explorer',
      url: 'https://explorer.testnet.citrea.xyz',
      apiUrl: 'https://explorer.testnet.citrea.xyz/api',
    },
  },
  testnet: true,
})
