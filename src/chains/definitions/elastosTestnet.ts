import * as Chain from '../../core/Chain.js'

export const elastosTestnet = /*#__PURE__*/ Chain.from({
  id: 21,
  name: 'Elastos Smart Chain Testnet',
  nativeCurrency: { name: 'tELA', symbol: 'tELA', decimals: 18 },
  rpcUrls: {
    http: 'https://api-testnet.elastos.io/eth',
  },
  blockExplorers: {
    name: 'Elastos Explorer',
    url: 'https://esc-testnet.elastos.io',
  },
  testnet: true,
})
