import { defineChain } from '../../utils/chain/defineChain.js'

export const morphTachyonTestnet = /*#__PURE__*/ defineChain({
  id: 34952,
  name: 'Morph Tachyon Testnet',
  nativeCurrency: {
    name: 'BGB',
    symbol: 'BGB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-api.popdex.xyz/api/v1/web3/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Morph Tachyon Testnet Explorer',
      url: 'https://testnet-app.popdex.xyz/explorer',
    },
  },
  testnet: true,
})
