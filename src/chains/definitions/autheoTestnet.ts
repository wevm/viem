import * as Chain from '../../core/Chain.js'

export const autheoTestnet = /*#__PURE__*/ Chain.define({
  id: 785n,
  name: 'Autheo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Autheo',
    symbol: 'THEO',
  },
  rpcUrls: {
    default: {
      http: [
        'https://testnet-rpc1.autheo.com',
        'https://testnet-rpc2.autheo.com',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Autheo Testnet Block Explorer',
      url: 'https://testnet-explorer.autheo.com/',
    },
  },
  testnet: true,
})
