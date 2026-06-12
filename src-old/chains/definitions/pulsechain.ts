import { defineChain } from '../../utils/chain/defineChain.js'

export const pulsechain = /*#__PURE__*/ defineChain({
  id: 369,
  name: 'PulseChain',
  nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  testnet: false,
  blockTime: 10_000,
  rpcUrls: {
    default: {
      http: ['https://rpc.pulsechain.com'],
      webSocket: ['wss://ws.pulsechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PulseScan',
      url: 'https://ipfs.scan.pulsechain.com',
      apiUrl: 'https://api.scan.pulsechain.com/api',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601,
    },
  },
})
