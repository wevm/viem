import { defineChain } from '../../utils/chain/defineChain.js'

export const plasmaDevnet = /*#__PURE__*/ defineChain({
  id: 9747,
  name: 'Plasma Devnet',
  nativeCurrency: {
    name: 'Devnet Plasma',
    symbol: 'XPL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://devnet-rpc.plasma.to'],
    },
  },
  testnet: true,
})
