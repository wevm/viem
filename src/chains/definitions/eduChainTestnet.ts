import { defineChain } from '../../utils/chain/defineChain.js'

export const eduChainTestnet = /*#__PURE__*/ defineChain({
  id: 656476,
  name: 'EDU Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'EDU',
    symbol: 'EDU',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.open-campus-codex.gelato.digital/'],
      webSocket: ['wss://ws.open-campus-codex.gelato.digital'],
    },
  },
  blockExplorers: {
    default: {
      name: 'EDU Chain Testnet Explorer',
      url: 'https://opencampus-codex.blockscout.com',
      apiUrl: 'https://opencampus-codex.blockscout.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 15514133,
    },
  },
  testnet: true,
})
