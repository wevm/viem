import * as Chain from '../../core/Chain.js'

export const bscGreenfield = /*#__PURE__*/ Chain.from({
  id: 1017,
  name: 'BNB Greenfield Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: { http: 'https://greenfield-chain.bnbchain.org' },
  blockExplorers: {
    name: 'BNB Greenfield Mainnet Scan',
    url: 'https://greenfieldscan.com',
  },
  testnet: false,
})
