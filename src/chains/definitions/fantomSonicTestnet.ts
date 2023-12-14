import { defineChain } from '../../utils/chain/defineChain.js'

export const fantomSonicTestnet = /*#__PURE__*/ defineChain({
  id: 64_240,
  name: 'Fantom Sonic Open Testnet',
  network: 'fantom-sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: {
    default: { http: ['https://rpcapi.sonic.fantom.network'] },
    public: { http: ['https://rpcapi.sonic.fantom.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Fantom Sonic Open Testnet Explorer',
      url: 'https://public-sonic.fantom.network',
    },
  },
  testnet: true,
})
