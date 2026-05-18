import { defineChain } from '../../utils/chain/defineChain.js'

export const sentrix = /*#__PURE__*/ defineChain({
  id: 7119,
  name: 'Sentrix Chain',
  nativeCurrency: { name: 'Sentrix', symbol: 'SRX', decimals: 18 },
  blockTime: 1_000,
  rpcUrls: {
    default: {
      http: ['https://rpc.sentrixchain.com'],
      webSocket: ['wss://rpc.sentrixchain.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SentrixScan',
      url: 'https://scan.sentrixchain.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xFd4b34b5763f54a580a0d9f7997A2A993ef9ceE9',
      blockCreated: 717_078,
    },
  },
})
