import * as Chain from '../../core/Chain.js'

export const zilliqaTestnet = /*#__PURE__*/ Chain.define({
  id: 33101n,
  name: 'Zilliqa Testnet',
  network: 'zilliqa-testnet',
  nativeCurrency: { name: 'Zilliqa', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dev-api.zilliqa.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ethernal',
      url: 'https://evmx.testnet.zilliqa.com',
    },
  },
  testnet: true,
})
