import { defineChain } from '../../utils/chain/defineChain.js'

export const paseoPassetHub = /*#__PURE__*/ defineChain({
  id: 420_420_417,
  name: 'Polkadot Hub TestNet',
  nativeCurrency: {
    name: 'PAS',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-testnet.polkadot.io',
    },
  },
  testnet: true,
})
