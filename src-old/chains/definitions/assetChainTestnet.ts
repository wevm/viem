import { defineChain } from '../../utils/chain/defineChain.js'

export const assetChainTestnet = /*#__PURE__*/ defineChain({
  id: 42_421,
  name: 'AssetChain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Real World Asset',
    symbol: 'RWA',
  },
  rpcUrls: {
    default: { http: ['https://enugu-rpc.assetchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Asset Chain Testnet Explorer',
      url: 'https://scan-testnet.assetchain.org',
      apiUrl: 'https://scan-testnet.assetchain.org/api',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x989F832D35988cb5e3eB001Fa2Fe789469EC31Ea',
      blockCreated: 17177,
    },
  },
})
