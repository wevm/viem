import * as Chain from '../../core/Chain.js'

export const eni = /*#__PURE__*/ Chain.define({
  id: 173n,
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
