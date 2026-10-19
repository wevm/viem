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
      address: '0x1de6B233984583F4d936ae4265f3b60282b70cc6',
    },
    erc4626EngineFactory: {
      address: '0x0d57c10249eb3a92b7d81bBA6221F80F2865448A',
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
