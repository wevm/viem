import { chainConfig } from '../../op-stack/chainConfig.js'
import { defineChain } from '../../utils/chain/defineChain.js'

const sourceId = 1 // mainnet

export const codex = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 81224,
  name: 'Codex',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.codex.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Codex Explorer',
      url: 'https://explorer.codex.xyz',
      apiUrl: 'https://explorer.codex.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: {
      [sourceId]: {
        address: '0x6A3855dc26e2beA8Ac73f82Cda79f3808B6C6F6C',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x52759C07A759c81BAab28AE1BE5A19e6450959bD',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xa6b1A05a592719B0C8a70c69eac114C48410aDE4',
      },
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
  sourceId,
})
