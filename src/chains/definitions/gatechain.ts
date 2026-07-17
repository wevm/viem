import * as Chain from '../../core/Chain.js'

export const gatechain = /*#__PURE__*/ Chain.from({
  id: 86,
  name: 'GateChain Mainnet',
  nativeCurrency: { name: 'GateChainToken', symbol: 'GT', decimals: 18 },
  rpcUrls: {
    http: 'https://evm.nodeinfo.cc',
    ws: 'wss://evm-ws.gatenode.cc',
  },
  blockExplorers: {
    name: 'Gate Scan',
    url: 'https://www.gatescan.org',
    apiUrl: 'https://gatescan.org/api',
  },
  testnet: false,
})
