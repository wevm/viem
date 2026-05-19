import * as Chain from '../../core/Chain.js'

export const mitosisTestnet = /*#__PURE__*/ Chain.define({
  id: 124_832n,
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
