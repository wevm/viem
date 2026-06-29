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
  tokens: {
    pathusd: {
      address: '0x20c0000000000000000000000000000000000000',
      decimals: 6,
      name: 'PathUSD',
      symbol: 'pathUSD',
    },
    usdce: {
      address: '0x20c0000000000000000000009e8d7eb59b783726',
      decimals: 6,
      name: 'Bridged USDC (Stargate)',
      symbol: 'USDC.e',
    },
    eurce: {
      address: '0x20c000000000000000000000d72572838bbee59c',
      decimals: 6,
      name: 'Bridged EURC (Stargate)',
      symbol: 'EURC.e',
    },
    alphausd: {
      address: '0x20c0000000000000000000000000000000000001',
      decimals: 6,
      name: 'AlphaUSD',
      symbol: 'alphaUSD',
    },
    betausd: {
      address: '0x20c0000000000000000000000000000000000002',
      decimals: 6,
      name: 'BetaUSD',
      symbol: 'betaUSD',
    },
    thetausd: {
      address: '0x20c0000000000000000000000000000000000003',
      decimals: 6,
      name: 'ThetaUSD',
      symbol: 'thetaUSD',
    },
  },
})
