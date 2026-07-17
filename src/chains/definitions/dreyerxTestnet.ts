import * as Chain from '../../core/Chain.js'

export const dreyerxTestnet = /*#__PURE__*/ Chain.from({
  id: 23452,
  name: 'DreyerX Testnet',
  nativeCurrency: {
    name: 'DreyerX',
    symbol: 'DRX',
    decimals: 18,
  },
  rpcUrls: {
    http: 'http://testnet-rpc.dreyerx.com',
  },
  blockExplorers: {
    name: 'DreyerX Testnet Scan',
    url: 'https://testnet-scan.dreyerx.com',
  },
  testnet: true,
})
