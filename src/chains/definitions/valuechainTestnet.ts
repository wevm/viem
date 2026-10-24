import { defineChain } from '../../utils/chain/defineChain.js'

/** ValueChain testnet. */
export const valuechainTestnet = /*#__PURE__*/ defineChain({
  id: 138_565,
  name: 'ValueChain Testnet',
  blockTime: 2_000,
  nativeCurrency: { name: 'SOSO', symbol: 'SOSO', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.valuechain.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ValueChain Testnet Explorer',
      url: 'https://test-scan.valuechain.xyz',
    },
  },
  testnet: true,
})
