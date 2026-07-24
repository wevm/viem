import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 1 // mainnet

export const bob = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 60808,
  name: 'BOB',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://rpc.gobob.xyz',
    ws: 'wss://rpc.gobob.xyz',
  },
  blockExplorers: {
    name: 'BOB Explorer',
    url: 'https://explorer.gobob.xyz',
  },
  contracts: {
    ...chainConfig.contracts,
    create2: Contracts.create2,
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
