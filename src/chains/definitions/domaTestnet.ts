import * as Chain from '../../core/Chain.js'

export const domaTestnet = /*#__PURE__*/ Chain.define({
  id: 97_476n,
  name: 'Doma Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.doma.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Doma Testnet Explorer',
      url: 'https://explorer-testnet.doma.xyz',
    },
  },
  testnet: true,
})
