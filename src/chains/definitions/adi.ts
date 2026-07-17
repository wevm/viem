import * as Chain from '../../core/Chain.js'

export const adi = /*#__PURE__*/ Chain.from({
  id: 36900,
  name: 'ADI_Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'ADI',
    symbol: 'ADI',
  },
  rpcUrls: {
    http: 'https://rpc.adifoundation.ai',
  },
  blockExplorers: {
    name: 'ADI Explorer',
    url: 'https://explorer.adifoundation.ai',
  },
  testnet: false,
})
