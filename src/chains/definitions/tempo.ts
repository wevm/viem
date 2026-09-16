import { chainConfig } from '../../tempo/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

export const tempo = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 4217,
  blockExplorers: {
    default: {
      name: 'Tempo Explorer',
      url: 'https://explore.tempo.xyz',
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
  name: 'Tempo Mainnet',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.tempo.xyz'],
      webSocket: ['wss://rpc.tempo.xyz'],
    },
  },
})
