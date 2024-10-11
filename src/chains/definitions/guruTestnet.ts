// src/chains/definitions/example.ts
import { defineChain } from '../../utils/chain/defineChain.js'

export const guruTestnet = /*#__PURE__*/ defineChain({
  id: 261,
  name: 'Guru Network Testnet',
  nativeCurrency: {
    name: 'testGURU',
    symbol: 'tGURU',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.gurunetwork.ai/archive/261'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Guruscan',
      url: 'https://scan.gurunetwork.ai',
    },
  },
  contracts: {
    multicall3: {
      address: '0xbd8c7f4064f121fa8bea8ac4ee1e7c9aec8ca7ba',
      blockCreated: 5677926,
    },
  },
  testnet: true,
})
