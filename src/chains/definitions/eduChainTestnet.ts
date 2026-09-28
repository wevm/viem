import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const eduChainTestnet = /*#__PURE__*/ Chain.from({
  id: 656476,
  name: 'EDU Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EDU',
    symbol: 'EDU',
  },
  rpcUrls: {
    http: 'https://rpc.testnet.educhain.xyz',
    ws: 'wss://rpc.testnet.educhain.xyz',
  },
  blockExplorers: {
    name: 'EDU Chain Testnet Explorer',
    url: 'https://explorer.testnet.educhain.xyz/',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 15514133,
    },
  },
  testnet: true,
})
