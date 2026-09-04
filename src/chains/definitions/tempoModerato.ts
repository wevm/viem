import { chainConfig } from '../../tempo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempoModerato = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 42431,
  hardfork: 't5',
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.testnet.tempo.xyz',
    },
  },
  contracts: {
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
    default: {
      http: ['https://rpc.moderato.tempo.xyz'],
      webSocket: ['wss://rpc.moderato.tempo.xyz'],
    },
  },
  testnet: true,
})
