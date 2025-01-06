import { defineChain } from '../../utils/chain/defineChain.js'

export const lumiaMainnet = /*#__PURE__*/ defineChain({
  id: 994873017,
  name: 'Lumia Mainnet',
  network: 'LumiaMainnet',
  nativeCurrency: { name: 'Lumia', symbol: 'LUMIA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.lumia.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lumia Explorer',
      url: 'https://explorer.lumia.org/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3975939,
    },
  },
  testnet: false,
})
