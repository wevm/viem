import * as Chain from '../../core/Chain.js'

export const confluxESpaceTestnet = /*#__PURE__*/ Chain.define({
  id: 71n,
  name: 'Conflux eSpace Testnet',
  network: 'cfx-espace-testnet',
  testnet: true,
  nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmtestnet.confluxrpc.com'],
      webSocket: ['wss://evmtestnet.confluxrpc.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ConfluxScan',
      url: 'https://evmtestnet.confluxscan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xEFf0078910f638cd81996cc117bccD3eDf2B072F',
      blockCreated: 117499050,
    },
  },
})
