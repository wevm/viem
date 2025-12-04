import { defineChain } from '../../utils/chain/defineChain.js'

export const adiTestnet = /*#__PURE__*/ defineChain({
  id: 99999,
  name: 'ADI Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ADI',
    symbol: 'ADI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.adifoundation.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ADI Explorer',
      url: 'https://explorer.testnet.adifoundation.ai',
    },
  },
  testnet: true,
})
