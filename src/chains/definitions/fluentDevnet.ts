import * as Chain from '../../core/Chain.js'

export const fluentDevnet = /*#__PURE__*/ Chain.from({
  id: 20_993,
  name: 'Fluent Devnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.devnet.fluent.xyz',
  },
  blockExplorers: {
    name: 'Fluent Devnet Explorer',
    url: 'https://devnet.fluentscan.xyz',
  },
  testnet: true,
})
