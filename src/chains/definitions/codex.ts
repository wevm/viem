import { defineChain } from '../../utils/chain/defineChain.js'
import { chainConfig } from '../../op-stack/chainConfig.js'

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
        address: '0x0d972E08B6d070c40aC81B6699e072712943Fa13',
      },
    },
    l2OutputOracle: {
      [sourceId]: {
        address: '0x4d97032d49d74Ec7c63aBAEbB0cC4f2fB12307F0',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x52759C07A759c81BAab28AE1BE5A19e6450959bD',
        blockCreated: 20962920,
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xa6b1A05a592719B0C8a70c69eac114C48410aDE4',
        blockCreated: 20962920,
      },
    },
  },
})
