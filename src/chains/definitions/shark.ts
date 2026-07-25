import { defineChain } from '../../utils/chain/defineChain.js'

export const shark = /*#__PURE__*/ defineChain({
  id: 88118,
  name: 'Shark Network',
  nativeCurrency: {
    decimals: 18,
    name: 'Shark',
    symbol: 'SHARK',
  },
  rpcUrls: {
    default: { http: ['https://rpc.rpcshark.com'] },
  },
  blockExplorers: {
    default: {
      name: 'SharkScan',
      url: 'https://sharkscan.app',
      apiUrl: 'https://sharkscan.app/api',
    },
  },
  contracts: {
    // Add contracts here if needed (e.g. multicall3)
  },
})
