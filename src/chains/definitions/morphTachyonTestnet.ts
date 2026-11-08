import * as Chain from '../../core/Chain.js'

export const morphTachyonTestnet = /*#__PURE__*/ Chain.from({
  id: 34952,
  name: 'Morph Tachyon Testnet',
  nativeCurrency: {
    name: 'BGB',
    symbol: 'BGB',
    decimals: 18,
  },
  rpcUrls: { http: 'https://testnet-api.popdex.xyz/api/v1/web3/rpc' },
  blockExplorers: {
    name: 'Morph Tachyon Testnet Explorer',
    url: 'https://testnet-app.popdex.xyz/explorer',
  },
  testnet: true,
})
