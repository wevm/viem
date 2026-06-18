import * as Chain from '../../core/Chain.js'

export const gatechain = /*#__PURE__*/ Chain.from({
  id: 86,
  name: 'GateChain Mainnet',
  nativeCurrency: { name: 'GateChainToken', symbol: 'GT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm.nodeinfo.cc'],
      webSocket: ['wss://evm-ws.gatenode.cc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Gate Scan',
      url: 'https://www.gatescan.org',
      apiUrl: 'https://gatescan.org/api',
    },
  },
  testnet: false,
})
