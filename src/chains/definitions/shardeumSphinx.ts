import * as Chain from '../../core/Chain.js'

export const shardeumSphinx = /*#__PURE__*/ Chain.define({
  id: 8082n,
  name: 'Shardeum Sphinx',
  nativeCurrency: { name: 'SHARDEUM', symbol: 'SHM', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sphinx.shardeum.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shardeum Explorer',
      url: 'https://explorer-sphinx.shardeum.org',
    },
  },
  testnet: true,
})
