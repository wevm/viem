import * as Chain from '../../core/Chain.js'

export const near = /*#__PURE__*/ Chain.from({
  id: 397,
  name: 'NEAR Protocol',
  nativeCurrency: {
    decimals: 18,
    name: 'NEAR',
    symbol: 'NEAR',
  },
  rpcUrls: { http: 'https://eth-rpc.mainnet.near.org' },
  blockExplorers: {
    name: 'NEAR Explorer',
    url: 'https://eth-explorer.near.org',
  },
  testnet: false,
})
