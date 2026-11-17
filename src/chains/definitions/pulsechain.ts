import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const pulsechain = /*#__PURE__*/ Chain.from({
  id: 369,
  name: 'PulseChain',
  nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  testnet: false,
  blockTime: 10_000,
  rpcUrls: {
    http: 'https://rpc.pulsechain.com',
    ws: 'wss://ws.pulsechain.com',
  },
  blockExplorers: {
    name: 'PulseScan',
    url: 'https://ipfs.scan.pulsechain.com',
    apiUrl: 'https://api.scan.pulsechain.com/api',
  },
  contracts: {
    create2: Contracts.create2,
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 14353601,
    },
  },
})
