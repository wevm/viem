import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const sophon = /*#__PURE__*/ defineChain({
  ...chainConfig,
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
