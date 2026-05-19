import * as Chain from '../../core/Chain.js'

export const atletaOlympia = /*#__PURE__*/ Chain.define({
  id: 2340n,
  name: 'Atleta Olympia',
  nativeCurrency: { decimals: 18, name: 'Atla', symbol: 'ATLA' },
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
      name: 'Atleta Olympia Explorer',
      url: 'https://blockscout.atleta.network',
      apiUrl: 'https://blockscout.atleta.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0x1472ec6392180fb84F345d2455bCC75B26577115',
      blockCreated: 1076473,
    },
  },
  testnet: true,
})
