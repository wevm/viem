import { defineChain } from '../../utils/chain/defineChain.js'

export const fantomSonicTestnet = /*#__PURE__*/ defineChain({
  id: 64_165,
  name: 'Fantom Sonic Open Testnet',
  network: 'fantom-sonic-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.soniclabs.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Fantom Sonic Open Testnet Explorer',
      url: 'https://public-sonic.fantom.network',
    },
  },
  testnet: true,
})
