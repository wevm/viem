import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

const sourceId = 1 // mainnet

export const worldchain = /*#__PURE__*/ Chain.from({
  ...chainConfig,
  id: 480,
  name: 'World Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'https://worldchain-mainnet.g.alchemy.com/public' },
  blockExplorers: {
    name: 'Worldscan',
    url: 'https://worldscan.org',
    apiUrl: 'https://api.worldscan.org/api',
  },
  contracts: {
    ...chainConfig.contracts,
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
    disputeGameFactory: {
      [sourceId]: {
        address: '0x069c4c579671f8c120b1327a73217D01Ea2EC5ea',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x19A6d1E9034596196295CF148509796978343c5D',
      },
    },
    portal: {
      [sourceId]: {
        address: '0xd5ec14a83B7d95BE1E2Ac12523e2dEE12Cbeea6C',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x470458C91978D2d929704489Ad730DC3E3001113',
      },
    },
  },
  testnet: false,
  sourceId,
})
