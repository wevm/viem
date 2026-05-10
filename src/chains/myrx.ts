import { defineChain } from '../../utils/chain/defineChain.js'

export const myrx = /*#__PURE__*/ defineChain({
  id: 8472,
  name: 'MYRX-MAINNET',
  nativeCurrency: {
    decimals: 18,
    name: 'MyRx Token',
    symbol: 'MRT',
  },
  rpcUrls: {
    default: { http: ['https://rpc.myrxwallet.io'] },
  },
  blockExplorers: {
    default: { name: 'MyRx Explorer', url: 'https://explorer.myrxwallet.io' },
  },
})
