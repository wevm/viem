import * as Chain from '../../core/Chain.js'

export const eCannaTestnet = /*#__PURE__*/ Chain.from({
  id: 4112,
  name: 'E Canna Testnet',
  nativeCurrency: {
    name: 'E Canna Testnet',
    symbol: 'tECNA',
    decimals: 18,
  },
  rpcUrls: {
    http: ['https://testnetrpc.ecnascan.com'],
  },
  blockExplorers: {
    name: 'ECNA Scan Testnet',
    url: 'https://testnetexplorer.ecnascan.com',
  },
  testnet: true,
})
