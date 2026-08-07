import { defineChain } from '../../utils/chain/defineChain.js'

export const recanetTestnet = /*#__PURE__*/ defineChain({
  id: 785,
  name: 'RECYCLEFARM Carbon Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tRCF',
    symbol: 'tRCF',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.recyclefarm.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'RECANET Testnet Block Explorer',
      url: 'https://testnet.recyclefarm.io/',
    },
  },
  testnet: true,
})
