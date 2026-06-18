import * as Chain from '../../core/Chain.js'

export const pumpfiTestnet = /*#__PURE__*/ Chain.from({
  id: 490_092,
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
