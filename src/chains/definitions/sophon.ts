import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

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
    http: 'https://rpc.sophon.xyz',
    ws: 'wss://rpc.sophon.xyz/ws',
  },
  blockExplorers: {
    name: 'Sophon Block Explorer',
    url: 'https://explorer.sophon.xyz',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x5f4867441d2416cA88B1b3fd38f21811680CD2C8',
      blockCreated: 116,
    },
  },
  testnet: false,
})
