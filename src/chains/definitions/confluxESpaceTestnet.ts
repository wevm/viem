import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const confluxESpaceTestnet = /*#__PURE__*/ Chain.from({
  id: 71,
  name: 'Conflux eSpace Testnet',
  testnet: true,
  nativeCurrency: { name: 'Conflux', symbol: 'CFX', decimals: 18 },
  rpcUrls: {
    http: 'https://evmtestnet.confluxrpc.com',
    ws: 'wss://evmtestnet.confluxrpc.com/ws',
  },
  blockExplorers: {
    name: 'ConfluxScan',
    url: 'https://evmtestnet.confluxscan.org',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xEFf0078910f638cd81996cc117bccD3eDf2B072F',
      blockCreated: 117499050,
    },
  },
})
