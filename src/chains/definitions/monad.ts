import { defineChain } from '../../utils/chain/defineChain.js'

export const monad = /*#__PURE__*/ defineChain({
  id: 143,
  name: 'Monad',
  blockTime: 400,
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monvision',
      url: 'https://mainnet-beta.monvision.io',
    },
  },
  testnet: false,
})
