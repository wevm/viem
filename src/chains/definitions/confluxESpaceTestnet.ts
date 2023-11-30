import { defineChain } from '../../utils/chain/defineChain.js'

export const confluxESpaceTestnet = /*#__PURE__*/ defineChain({
  id: 71,
  name: 'Conflux eSpace Testnet',
  network: 'cfx-espace-testnet',
  testnet: true,
  nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evmtestnet.confluxrpc.org'],
      webSocket: ['wss://evmtestnet.confluxrpc.org/ws'],
    },
    public: {
      http: ['https://evmtestnet.confluxrpc.org'],
      webSocket: ['wss://evmtestnet.confluxrpc.org/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ConfluxScan',
      url: 'https://evmtestnet.confluxscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xEFf0078910f638cd81996cc117bccD3eDf2B072F',
      blockCreated: 117499050,
    },
  },
})
