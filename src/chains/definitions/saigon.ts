import { defineChain } from '../../utils/chain/defineChain.js'

export const saigon = /*#__PURE__*/ defineChain({
  id: 2021,
  name: 'Saigon Testnet',
  network: 'saigon',
  nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://saigon-testnet.roninchain.com/rpc'],
    },
    public: {
      http: ['https://saigon-testnet.roninchain.com/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Saigon Explorer',
      url: 'https://saigon-explorer.roninchain.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 18736871,
    },
  },
  testnet: true,
})
