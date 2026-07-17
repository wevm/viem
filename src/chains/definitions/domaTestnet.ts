import * as Chain from '../../core/Chain.js'

export const domaTestnet = /*#__PURE__*/ Chain.from({
  id: 97_476,
  name: 'Doma Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: { http: 'https://rpc-testnet.doma.xyz' },
  blockExplorers: {
    name: 'Doma Testnet Explorer',
    url: 'https://explorer-testnet.doma.xyz',
  },
  testnet: true,
})
