import * as Chain from '../../core/Chain.js'

export const ql1 = /*#__PURE__*/ Chain.define({
  id: 766n,
  name: 'QL1',
  nativeCurrency: {
    decimals: 18,
    name: 'QOM',
    symbol: 'QOM',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.qom.one'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ql1 Explorer',
      url: 'https://scan.qom.one',
    },
  },
  contracts: {
    multicall3: {
      address: '0x7A52370716ea730585884F5BDB0f6E60C39b8C64',
    },
  },
  testnet: false,
})
