import { defineChain } from '../../utils/chain/defineChain.js'

export const eCannaTestnet = /*#__PURE__*/ defineChain({
  id: 4112,
  name: 'E Canna Testnet',
  nativeCurrency: {
    name: 'E Canna Testnet',
    symbol: 'tECNA',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnetrpc.ecnascan.com'] },
  },
  blockExplorers: {
    default: {
      name: 'ECNA Scan Testnet',
      url: 'https://testnetexplorer.ecnascan.com',
    },
  },
  testnet: true,
})
