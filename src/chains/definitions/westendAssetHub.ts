import { defineChain } from '../../utils/chain/defineChain.js'

export const westendAssetHub = /*#__PURE__*/ defineChain({
  id: 420_420_421,
  name: 'Westend Asset Hub',
  nativeCurrency: {
    decimals: 18,
    name: 'Westies',
    symbol: 'WND',
  },
  rpcUrls: {
    default: { http: ['https://westend-asset-hub-eth-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: {
      name: 'subscan',
      url: 'https://westend-asset-hub-eth-explorer.parity.io',
    },
  },
  testnet: true,
})
