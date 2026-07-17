import * as Chain from '../../core/Chain.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 11_155_111 // sepolia

export const bobSepolia = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 808813,
  name: 'BOB Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://bob-sepolia.rpc.gobob.xyz',
    ws: 'wss://bob-sepolia.rpc.gobob.xyz',
  },
  blockExplorers: {
    name: 'BOB Sepolia Explorer',
    url: 'https://bob-sepolia.explorer.gobob.xyz',
  },
  contracts: {
    ...chainConfig.contracts,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 35677,
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x14D0069452b4AE2b250B395b8adAb771E4267d2f',
        blockCreated: 4462615,
      },
    },
    portal: {
      [sourceId]: {
        address: '0x867B1Aa872b9C8cB5E9F7755feDC45BB24Ad0ae4',
        blockCreated: 4462615,
      },
    },
  },
  testnet: true,
  sourceId,
})
