import { defineChain } from '../../utils/chain/defineChain.js'

export const shardeumSphinx = /*#__PURE__*/ defineChain({
  id: 8082,
  name: 'Shardeum Sphinx',
  network: 'shmSphinx',
  nativeCurrency: { name: 'SHARDEUM', symbol: 'SHM', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sphinx.shardeum.org'],
    },
    public: {
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
