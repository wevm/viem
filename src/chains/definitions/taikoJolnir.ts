import { defineChain } from '../../utils/chain/defineChain.js'

export const taikoJolnir = /*#__PURE__*/ defineChain({
  id: 167007,
  name: 'Taiko Jolnir (Alpha-5 Testnet)',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.jolnir.taiko.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.jolnir.taiko.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 732706,
    },
  },
  testnet: true,
})
