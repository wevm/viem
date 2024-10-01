import { defineChain } from '../../utils/chain/defineChain.js'

export const assetChain = /*#__PURE__*/ defineChain({
  id: 42_420,
  name: 'AssetChain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Real World Asset',
    symbol: 'RWA',
  },
  rpcUrls: {
    default: { http: ['https://mainnet-rpc.assetchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Asset Chain Explorer',
      url: 'https://scan.assetchain.org',
      apiUrl: 'https://scan.assetchain.org/api',
    },
  },
  testnet: false,
  contracts: {},
})
