import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const bob = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 60808,
  name: 'BOB',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.gobob.xyz'],
      webSocket: ['wss://rpc.gobob.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOB Explorer',
      url: 'https://explorer.gobob.xyz',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 23131,
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0xdDa53E23f8a32640b04D7256e651C1db98dB11C1',
        blockCreated: 4462615,
      },
    },
    portal: {
      [sourceId]: {
        address: '0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E',
        blockCreated: 4462615,
      },
    },
  },
  sourceId,
})
