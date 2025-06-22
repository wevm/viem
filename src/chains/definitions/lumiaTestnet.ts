import { defineChain } from '../../utils/chain/defineChain.js'

export const lumiaTestnet = /*#__PURE__*/ defineChain({
  id: 2030232745,
  name: 'Lumia Beam Testnet',
  network: 'Lumia Beam Testnet',
  nativeCurrency: {
    name: 'Lumia',
    symbol: 'LUMIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://beam-rpc.lumia.org/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lumia Beam Testnet Explorer',
      url: 'https://beam-explorer.lumia.org/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1414395,
    },
  },
  testnet: true,
})
