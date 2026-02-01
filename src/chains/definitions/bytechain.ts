import { defineChain } from '../../utils/chain/defineChain.js'

export const bytechain = /*#__PURE__*/ defineChain({
  id: 9_933,
  name: 'ByteChain',
  nativeCurrency: { name: 'BEXC', symbol: 'BEXC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.bexc.io'] },
  },
  blockExplorers: {
    default: {
      name: 'ByteChain Explorer',
      url: 'https://mainnet.bexc.io',
      apiUrl: 'https://mainnet.bexc.io/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xB31890902ce6D39045887e76d27261a1203516a8',
      blockCreated: 28_570,
    },
  },
  testnet: false,
})
