import * as Chain from '../../core/Chain.js'

export const adi = /*#__PURE__*/ Chain.define({
  id: 36900n,
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
