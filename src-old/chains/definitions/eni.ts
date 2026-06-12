import { defineChain } from '../../utils/chain/defineChain.js'

export const eni = /*#__PURE__*/ defineChain({
  id: 173,
  name: 'ENI Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ENI',
    symbol: 'ENI',
  },
  rpcUrls: {
    default: { http: ['https://rpc.eniac.network'] },
  },
  blockExplorers: {
    default: {
      name: 'ENI Explorer',
      url: 'https://scan.eniac.network',
    },
  },
  testnet: false,
})
