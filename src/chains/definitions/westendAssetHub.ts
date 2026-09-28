import * as Chain from '../../core/Chain.js'

export const westendAssetHub = /*#__PURE__*/ Chain.from({
  id: 420_420_421,
  name: 'Westend Asset Hub',
  nativeCurrency: {
    decimals: 18,
    name: 'Westies',
    symbol: 'WND',
  },
  rpcUrls: { http: 'https://westend-asset-hub-eth-rpc.polkadot.io' },
  blockExplorers: {
    name: 'subscan',
    url: 'https://westend-asset-hub-eth-explorer.parity.io',
  },
  testnet: true,
})
