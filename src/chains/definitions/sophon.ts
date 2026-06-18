import * as Chain from '../../core/Chain.js'

export const sophon = /*#__PURE__*/ Chain.from({
  blockTime: 200,
  id: 50104,
  name: 'Sophon',
  nativeCurrency: {
    decimals: 18,
    name: 'Sophon',
    symbol: 'SOPH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sophon.xyz'],
      webSocket: ['wss://rpc.sophon.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sophon Block Explorer',
      url: 'https://explorer.sophon.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0x5f4867441d2416cA88B1b3fd38f21811680CD2C8',
      blockCreated: 116,
    },
  },
  testnet: false,
})
