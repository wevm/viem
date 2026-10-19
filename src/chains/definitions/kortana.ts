import { defineChain } from '../../utils/chain/defineChain.js'

export const kortana = /*#__PURE__*/ defineChain({
  id: 9002,
  name: 'Kortana',
  nativeCurrency: {
    decimals: 18,
    name: 'Dinar',
    symbol: 'DNR',
  },
  rpcUrls: {
    default: { http: ['https://zeus-rpc.mainnet.kortana.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Kortana Explorer',
      url: 'https://explorer.mainnet.kortana.xyz',
    },
  },
})
