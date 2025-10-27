import { defineChain } from '../../utils/chain/defineChain.js'

export const kusamaAssetHub = /*#__PURE__*/ defineChain({
  id: 420_420_418,
  name: 'Kusama Asset Hub',
  nativeCurrency: {
    decimals: 18,
    name: 'Kusama',
    symbol: 'KSM',
  },
  rpcUrls: {
    default: { http: ['https://kusama-asset-hub-eth-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-kusama-asset-hub.parity-chains-scw.parity.io/',
    },
  },
  testnet: false,
})
