import * as Contracts from '../../core/internal/contracts.js'
import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../tempo/chainConfig.js'

export const tempoModerato = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 42431,
  hardfork: 't5',
  blockExplorers: {
    name: 'Tempo Explorer',
    url: 'https://explore.testnet.tempo.xyz',
  },
  contracts: {
    create2: Contracts.create2,
    earnFactory: {
      address: '0xb5889A96114014d4C032ebD76772c10bF3b97137',
    },
    erc4626EngineFactory: {
      address: '0xd43D00981222a8db444A528E69f19E3cE5A7D2Ff',
    },
  },
  name: 'Tempo Testnet (Moderato)',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    http: 'https://rpc.moderato.tempo.xyz',
    ws: 'wss://rpc.moderato.tempo.xyz',
  },
  testnet: true,
})
