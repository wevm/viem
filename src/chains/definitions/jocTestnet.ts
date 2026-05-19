import * as Chain from '../../core/Chain.js'

export const jocTestnet = /*#__PURE__*/ Chain.define({
  id: 10081n,
  name: 'Japan Open Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Japan Open Chain Testnet Token',
    symbol: 'JOCT',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-1.testnet.japanopenchain.org:8545',
        'https://rpc-2.testnet.japanopenchain.org:8545',
        'https://rpc-3.testnet.japanopenchain.org',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Testnet Block Explorer',
      url: 'https://explorer.testnet.japanopenchain.org',
    },
  },
  testnet: true,
})
