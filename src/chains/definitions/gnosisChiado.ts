import { defineChain } from '../../utils/chain.js'

export const gnosisChiado = /*#__PURE__*/ defineChain({
  id: 10_200,
  name: 'Gnosis Chiado',
  network: 'chiado',
  nativeCurrency: {
    decimals: 18,
    name: 'Gnosis',
    symbol: 'xDAI',
  },
  rpcUrls: {
    default: { http: ['https://rpc.chiadochain.net'] },
    public: { http: ['https://rpc.chiadochain.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.chiadochain.net',
    },
  },
})
