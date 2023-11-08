import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../opStack/chainConfig.js'

export const baseGoerli = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 84531,
  name: 'Base Goerli',
  nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://goerli.base.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: 'https://goerli.basescan.org',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1376988,
    },
  },
  testnet: true,
  sourceId: 5, // goerli
})
