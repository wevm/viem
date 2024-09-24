import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const shape = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 360,
  name: 'Shape',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.shape.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://internal-shaper-explorer.alchemypreview.com',
      apiUrl: 'https://internal-shaper-explorer.alchemypreview.com/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x6Ef8c69CfE4635d866e3E02732068022c06e724D',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1,
    },
  },
  sourceId,
})
