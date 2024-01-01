import { defineChain } from '../../utils/chain/defineChain.js'

export const oasisTestnet = /*#__PURE__*/ defineChain({
  id: 4090,
  network: 'oasis-testnet',
  name: 'Oasis Testnet',
  nativeCurrency: { name: 'Fasttoken', symbol: 'FTN', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc1.oasis.bahamutchain.com'] },
    public: { http: ['https://rpc1.oasis.bahamutchain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Ftnscan',
      url: 'https://oasis.ftnscan.com',
    },
  },
  testnet: true,
})
