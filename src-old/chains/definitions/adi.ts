import { defineChain } from '../../utils/chain/defineChain.js'

export const adi = /*#__PURE__*/ defineChain({
  id: 36900,
  name: 'ADI_Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'ADI',
    symbol: 'ADI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.adifoundation.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ADI Explorer',
      url: 'https://explorer.adifoundation.ai',
    },
  },
  testnet: false,
})
