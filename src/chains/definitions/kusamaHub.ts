import { defineChain } from '../../utils/chain/defineChain.js'

export const kusamaHub = /*#__PURE__*/ defineChain({
  id: 420_420_418,
  name: 'Kusama Hub',
  nativeCurrency: {
    name: 'KSM',
    symbol: 'KSM',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://kusama-asset-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-kusama-asset-hub.parity-chains-scw.parity.io',
    },
  },
})