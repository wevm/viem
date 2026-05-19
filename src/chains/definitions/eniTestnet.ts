import * as Chain from '../../core/Chain.js'

export const eniTestnet = /*#__PURE__*/ Chain.define({
  id: 6_912_115n,
  name: 'ENI Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ENI Testnet Token',
    symbol: 'ENI',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.eniac.network'] },
  },
  blockExplorers: {
    default: {
      name: 'ENI Testnet Explorer',
      url: 'https://scan-testnet.eniac.network',
    },
  },
  testnet: true,
})
