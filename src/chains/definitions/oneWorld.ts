import * as Chain from '../../core/Chain.js'

export const oneWorld = /*#__PURE__*/ Chain.from({
  id: 309075,
  name: 'One World Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OWCT',
    symbol: 'OWCT',
  },
  rpcUrls: { http: 'https://mainnet-rpc.oneworldchain.org' },
  blockExplorers: {
    name: 'One World Explorer',
    url: 'https://mainnet.oneworldchain.org',
  },
  testnet: false,
})
