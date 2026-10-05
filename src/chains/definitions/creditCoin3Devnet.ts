import * as Chain from '../../core/Chain.js'

export const creditCoin3Devnet = /*#__PURE__*/ Chain.from({
  id: 102032,
  name: 'Creditcoin Devnet',
  nativeCurrency: { name: 'Devnet CTC', symbol: 'devCTC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.cc3-devnet.creditcoin.network',
    ws: 'wss://rpc.cc3-devnet.creditcoin.network/ws',
  },
  blockExplorers: {
    name: 'Blockscout',
    url: 'https://creditcoin-devnet.blockscout.com',
    apiUrl: 'https://creditcoin3-dev.subscan.io',
  },
  contracts: {
    multicall3: {
      address: '0x47b51dC7b7Bbb3d9eB12080e3DA6E26125e8D75e',
      blockCreated: 16_352_786,
    },
  },
  testnet: true,
})
