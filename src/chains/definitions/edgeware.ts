import { defineChain } from '../../utils/chain/defineChain.js'

export const edgeware = /*#__PURE__*/ defineChain({
  id: 2021,
  name: 'Edgeware EdgeEVM Mainnet',
  network: 'edgeware',
  nativeCurrency: {
    decimals: 18,
    name: 'Edgeware',
    symbol: 'EDG',
  },
  rpcUrls: {
    default: { http: ['https://edgeware-evm.jelliedowl.net'] },
    public: { http: ['https://edgeware-evm.jelliedowl.net'] },
  },
  blockExplorers: {
    etherscan: { name: 'Edgscan by Bharathcoorg', url: 'https://edgscan.live' },
    default: { name: 'Edgscan by Bharathcoorg', url: 'https://edgscan.live' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 18117872,
    },
  },
})
