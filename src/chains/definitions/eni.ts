import * as Chain from '../../core/Chain.js'

export const eni = /*#__PURE__*/ Chain.from({
  id: 173,
  name: 'ENI Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ENI',
    symbol: 'ENI',
  },
  rpcUrls: { http: 'https://rpc.eniac.network' },
  blockExplorers: {
    name: 'ENI Explorer',
    url: 'https://scan.eniac.network',
  },
  testnet: false,
})
