import { defineChain } from '../../utils/chain/defineChain.js'

export const mandala = /*#__PURE__*/ defineChain({
  id: 595,
  name: 'Mandala TC9',
  network: 'mandala',
  nativeCurrency: {
    name: 'Mandala',
    symbol: 'mACA',
    decimals: 18,
  },
  rpcUrls: {
    public: {
      http: ['https://eth-rpc-tc9.aca-staging.network'],
      webSocket: ['wss://eth-rpc-tc9.aca-staging.network'],
    },
    default: {
      http: ['https://eth-rpc-tc9.aca-staging.network'],
      webSocket: ['wss://eth-rpc-tc9.aca-staging.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mandala Blockscout',
      url: 'https://blockscout.mandala.aca-staging.network',
      apiUrl: 'https://blockscout.mandala.aca-staging.network/api',
    },
  },
  testnet: true,
})
