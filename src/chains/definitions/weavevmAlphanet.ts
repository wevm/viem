import { defineChain } from '../../utils/chain/defineChain.js'

export const weaveVMAlphanet = /*#__PURE__*/ defineChain({
  id: 9496,
  name: 'WeaveVM Alphanet',
  network: 'weavevm-alphanet',
  nativeCurrency: { name: 'Testnet WeaveVM', symbol: 'tWVM', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.wvm.dev'] },
  },
  blockExplorers: {
    default: {
      name: 'WeaveVM Alphanet Explorer',
      url: 'https://explorer.wvm.dev',
    },
  },
  contracts: {
    multicall3: {
      address: '0x7c6db9c77dCE482dFCb315cD5B9B505702651d26',
      blockCreated: 1820864,
    },
  },
  testnet: true,
})
