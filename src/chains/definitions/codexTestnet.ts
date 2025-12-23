import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 11_155_111 // sepolia

export const codexTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 812242,
  name: 'Codex Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.codex-stg.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Codex Testnet Explorer',
      url: 'https://explorer.codex-stg.xyz',
      apiUrl: 'https://explorer.codex-stg.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0x390e24E8324E56f13A8d48eB938b6f9De24CD205',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x037F161D12c829A9ca4742eEd9371830CA54fcB2',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xCf4df2bDB14C8FDB25FdacCEC10Ce5C4bAEDB3De',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  sourceId,
})
