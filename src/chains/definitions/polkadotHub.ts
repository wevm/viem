import { defineChain } from '../../utils/chain/defineChain.js'

export const polkadotHub = /*#__PURE__*/ defineChain({
  id: 420_420_419,
  name: 'Polkadot Hub',
  nativeCurrency: {
    name: 'DOT',
    symbol: 'DOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/mainnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.polkadot.io',
    },
  },
})