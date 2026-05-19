import * as Chain from '../../core/Chain.js'

export const pumpfiTestnet = /*#__PURE__*/ Chain.define({
  id: 490_092n,
  name: 'Pumpfi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PMPT',
    symbol: 'PMPT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc1testnet.pumpfi.me'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Pumpfi Testnet Scan',
      url: 'https://testnetscan.pumpfi.me',
    },
  },
  testnet: true,
})
