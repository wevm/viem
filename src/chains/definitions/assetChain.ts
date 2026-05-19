import * as Chain from '../../core/Chain.js'

export const assetChain = /*#__PURE__*/ Chain.define({
  id: 42_420n,
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
