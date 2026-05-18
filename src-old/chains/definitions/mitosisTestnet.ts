import { defineChain } from '../../utils/chain/defineChain.js'

export const mitosisTestnet = /*#__PURE__*/ defineChain({
  id: 124_832,
  name: 'Mitosis Testnet',
  nativeCurrency: { name: 'MITO', symbol: 'MITO', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.mitosis.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mitosis testnet explorer',
      url: 'https://testnet.mitosiscan.xyz',
    },
  },
  testnet: true,
})
