import { defineChain } from '../../utils/chain/defineChain.js'

export const bscGreenfield = /*#__PURE__*/ defineChain({
  id: 1017,
  name: 'BNB Greenfield Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: { http: ['https://greenfield-chain.bnbchain.org'] },
  },
  blockExplorers: {
    default: {
      name: 'BNB Greenfield Mainnet Scan',
      url: 'https://greenfieldscan.com',
    },
  },
  testnet: false,
})
