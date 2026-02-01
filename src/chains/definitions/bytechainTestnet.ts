import { defineChain } from '../../utils/chain/defineChain.js'

export const bytechainTestnet = /*#__PURE__*/ defineChain({
  id: 3_399,
  name: 'ByteChain Testnet',
  nativeCurrency: { name: 'BEXC', symbol: 'BEXC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://test-rpc.bexc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'ByteChain Testnet Explorer',
      url: 'https://testnet.bexc.io',
      apiUrl: 'https://testnet.bexc.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x4b4801594F4fEa3bB4a0079ff25a9EB45c915bCA',
      blockCreated: 28_057,
    },
  },
  testnet: true,
})
