import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../zksync/chainConfig.js'

export const sophonTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  blockTime: 200,
  id: 531_050_104,
  name: 'Sophon Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sophon',
    symbol: 'SOPH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.sophon.xyz'],
      webSocket: ['wss://rpc.testnet.sophon.xyz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sophon Block Explorer',
      url: 'https://explorer.testnet.sophon.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0x83c04d112adedA2C6D9037bb6ecb42E7f0b108Af',
      blockCreated: 15_642,
    },
  },
  testnet: true,
})
