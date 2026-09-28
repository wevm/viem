import * as Chain from '../../core/Chain.js'

export const assetChain = /*#__PURE__*/ Chain.from({
  id: 42_420,
  name: 'AssetChain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Real World Asset',
    symbol: 'RWA',
  },
  rpcUrls: { http: 'https://mainnet-rpc.assetchain.org' },
  blockExplorers: {
    name: 'Asset Chain Explorer',
    url: 'https://scan.assetchain.org',
    apiUrl: 'https://scan.assetchain.org/api',
  },
  testnet: false,
  contracts: {},
})
