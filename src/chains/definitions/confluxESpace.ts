import { defineChain } from '../../utils/chain/defineChain.js'

export const confluxESpace = /*#__PURE__*/ defineChain({
  id: 1_030,
  name: 'Conflux eSpace',
  nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm.confluxrpc.com'],
      webSocket: ['wss://evm.confluxrpc.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'ConfluxScan',
      url: 'https://evm.confluxscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xEFf0078910f638cd81996cc117bccD3eDf2B072F',
      blockCreated: 68602935,
    },
  },
})
