import * as Chain from '../../core/Chain.js'

export const bscGreenfield = /*#__PURE__*/ Chain.define({
  id: 1017n,
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
