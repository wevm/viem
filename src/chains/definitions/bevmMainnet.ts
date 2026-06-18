import * as Chain from '../../core/Chain.js'

export const bevmMainnet = /*#__PURE__*/ Chain.from({
  id: 11501,
  name: 'BEVM Mainnet',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-mainnet-1.bevm.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Bevmscan',
      url: 'https://scan-mainnet.bevm.io',
      apiUrl: 'https://scan-mainnet-api.bevm.io/api',
    },
  },
})
