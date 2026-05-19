import * as Chain from '../../core/Chain.js'

const sourceId = 1n // mainnet

export const pgn = /*#__PURE__*/ Chain.define({
  id: 424n,
  network: 'pgn',
  name: 'PGN',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.publicgoods.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PGN Explorer',
      url: 'https://explorer.publicgoods.network',
      apiUrl: 'https://explorer.publicgoods.network/api',
    },
  },
  contracts: {
    l2OutputOracle: {
      [sourceId.toString()]: {
        address: '0x9E6204F750cD866b299594e2aC9eA824E2e5f95c',
      },
    },
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3380209,
    },
    portal: {
      [sourceId.toString()]: {
        address: '0xb26Fd985c5959bBB382BAFdD0b879E149e48116c',
      },
    },
    l1StandardBridge: {
      [sourceId.toString()]: {
        address: '0xD0204B9527C1bA7bD765Fa5CCD9355d38338272b',
      },
    },
  },
  sourceId,
})
