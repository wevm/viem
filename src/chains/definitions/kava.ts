import { defineChain } from '../../utils/chain/defineChain.js'

export const kava = /*#__PURE__*/ defineChain({
  id: 2222,
  name: 'Kava EVM',
  network: 'kava-mainnet',
  nativeCurrency: {
    name: 'Kava',
    symbol: 'KAVA',
    decimals: 18,
  },
  rpcUrls: {
    public: { http: ['https://evm.kava.io'] },
    default: { http: ['https://evm.kava.io'] },
  },
  blockExplorers: {
    default: { name: 'Kava EVM Explorer', url: 'https://kavascan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3661165,
    },
  },
  testnet: false,
})
