import { defineChain } from '../../utils/chain/defineChain.js'

export const lumiaTestnet = /*#__PURE__*/ defineChain({
  id: 1952959480,
  name: 'Lumia Testnet',
  network: 'LumiaTestnet',
  nativeCurrency: {
    name: 'Lumia',
    symbol: 'LUMIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.lumia.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lumia Testnet Explorer',
      url: 'https://testnet-explorer.lumia.org/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 2235063,
    },
  },
  testnet: true,
})
