import { defineChain } from '../../utils/chain/defineChain.js'

export const zilliqaTestnet = /*#__PURE__*/ defineChain({
  id: 33101,
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
