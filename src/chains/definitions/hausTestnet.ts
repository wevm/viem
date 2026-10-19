import { defineChain } from '../../utils/chain/defineChain.js'

export const hausTestnet = /*#__PURE__*/ defineChain({
  id: 2_443,
  name: 'Haus Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Haus',
    symbol: 'HAUS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.hausserver.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Haus Chain Testnet Explorer',
      url: 'https://explorer-testnet.hausserver.xyz',
      apiUrl: 'https://explorer-testnet.hausserver.xyz/api',
    },
  },
  testnet: true,
})
