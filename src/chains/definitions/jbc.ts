import { defineChain } from '../../utils/chain/defineChain.js'

export const jbc = /*#__PURE__*/ defineChain({
  id: 8899,
  name: 'JIBCHAIN L1',
  network: 'jbc',
  nativeCurrency: { name: 'JBC', symbol: 'JBC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-l1.jibchain.net'],
    },
    public: {
      http: ['https://rpc-l1.jibchain.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://exp-l1.jibchain.net',
    },
  },
  contracts: {
    multicall3: {
      address: '0xc0C8C486D1466C57Efe13C2bf000d4c56F47CBdC',
      blockCreated: 2299048,
    },
  },
  testnet: false,
})
