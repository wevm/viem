import * as Chain from '../../core/Chain.js'

export const sentrixTestnet = /*#__PURE__*/ Chain.define({
  id: 7120n,
  name: 'Sentrix Testnet',
  nativeCurrency: { name: 'Sentrix', symbol: 'SRX', decimals: 18 },
  blockTime: 1_000,
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.sentrixchain.com'],
      webSocket: ['wss://testnet-rpc.sentrixchain.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SentrixScan Testnet',
      url: 'https://scan-testnet.sentrixchain.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0x7900826De548425c6BE56caEbD4760AB0155Cd54',
      blockCreated: 723_191,
    },
  },
  testnet: true,
})
