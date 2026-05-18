import { defineChain } from '../../utils/chain/defineChain.js'

export const paseoPassetHub = /*#__PURE__*/ defineChain({
  id: 420_420_422,
  name: 'Paseo PassetHub',
  nativeCurrency: {
    name: 'PAS',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-passet-hub.parity-testnet.parity.io',
    },
  },
  testnet: true,
})
