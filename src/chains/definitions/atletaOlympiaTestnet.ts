import { defineChain } from '../../utils/chain/defineChain.js'

export const atletaOlympiaTestnet = /*#__PURE__*/ defineChain({
  id: 2340,
  name: 'Atleta Olympia Testnet',
  nativeCurrency: { decimals: 18, name: 'ATLA', symbol: 'ATLA' },
  rpcUrls: {
    default: {
      http: [
        'https://testnet-rpc.atleta.network:9944',
        'https://testnet-rpc.atleta.network',
      ],
      ws: ['wss://testnet-rpc.atleta.network:9944'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Atleta Olympia Testnet Explorer',
      url: 'https://blockscout.atleta.network/',
      apiUrl: 'https://blockscout.atleta.network//api',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x1472ec6392180fb84F345d2455bCC75B26577115',
      blockCreated: 1076473,
    },
  },
})
