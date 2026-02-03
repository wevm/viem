import { defineChain } from '../../utils/chain/defineChain.js'

export const citrea = /*#__PURE__*/ defineChain({
  id: 4114,
  name: 'Citrea Mainnet',
  nativeCurrency: { name: 'Citrea Bitcoin', symbol: 'cBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.mainnet.citrea.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Citrea Explorer',
      url: 'https://explorer.mainnet.citrea.xyz',
      apiUrl: 'https://explorer.mainnet.citrea.xyz/api',
    },
  },
  testnet: false,
})
