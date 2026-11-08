import * as Chain from '../../core/Chain.js'

export const sentrix = /*#__PURE__*/ Chain.from({
  id: 7119,
  name: 'Sentrix Chain',
  nativeCurrency: { name: 'Sentrix', symbol: 'SRX', decimals: 18 },
  blockTime: 1_000,
  rpcUrls: {
    http: 'https://rpc.sentrixchain.com',
    ws: 'wss://rpc.sentrixchain.com/ws',
  },
  blockExplorers: {
    name: 'SentrixScan',
    url: 'https://scan.sentrixchain.com',
  },
  contracts: {
    multicall3: {
      address: '0xFd4b34b5763f54a580a0d9f7997A2A993ef9ceE9',
      blockCreated: 717_078,
    },
  },
})
