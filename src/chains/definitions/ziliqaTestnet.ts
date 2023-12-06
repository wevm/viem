import { defineChain } from '../../utils/chain/defineChain.js'

export const ziliqaTestnet = /*#__PURE__*/ defineChain({
  id: 33101,
  name: 'Ziliqa Testnet',
  network: 'ziliqa-testnet',
  nativeCurrency: { name: 'Ziliqa', symbol: 'ZIL', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dev-api.zilliqa.com'],
    },
    public: {
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
