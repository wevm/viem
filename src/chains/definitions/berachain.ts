import { defineChain } from '../../utils/chain/defineChain.js'

export const berachain = /*#__PURE__*/ defineChain({
  id: 80094,
  name: 'Berachain',
  blockTime: 2_000,
  nativeCurrency: {
    decimals: 18,
    name: 'BERA Token',
    symbol: 'BERA',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    ensRegistry: {
      address: '0x5b22280886a2f5e09a49bea7e320eab0e5320e28',
      blockCreated: 877007,
    },
    ensUniversalResolver: {
      address: '0x4D41762915F83c76EcaF6776d9b08076aA32b492',
      blockCreated: 9310021,
    },
  },
  rpcUrls: {
    default: { http: ['https://rpc.berachain.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Berascan',
      url: 'https://berascan.com',
    },
  },
  ensTlds: ['.bera'],
  testnet: false,
})
