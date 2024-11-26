import { defineChain } from '../../utils/chain/defineChain.js'

export const iota = /*#__PURE__*/ defineChain({
  id: 8822,
  name: 'IOTA EVM',
  network: 'iotaevm',
  nativeCurrency: {
    decimals: 18,
    name: 'IOTA',
    symbol: 'IOTA',
  },
  rpcUrls: {
    default: {
      http: ['https://json-rpc.evm.iotaledger.net'],
      webSocket: ['wss://ws.json-rpc.evm.iotaledger.net'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Explorer',
      url: 'https://explorer.evm.iota.org',
      apiUrl: 'https://explorer.evm.iota.org/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 25022,
    },
  },
})
