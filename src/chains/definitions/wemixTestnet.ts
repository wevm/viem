import { defineChain } from '../../utils/chain/defineChain.js'

export const wemixTestnet = /*#__PURE__*/ defineChain({
  id: 1112,
  name: 'WEMIX Testnet',
  network: 'wemix-testnet',
  nativeCurrency: { name: 'WEMIX', symbol: 'tWEMIX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.test.wemix.com'] },
    public: { http: ['https://api.test.wemix.com'] },
  },
  blockExplorers: {
    etherscan: { name: 'wemixExplorer', url: 'https://testnet.wemixscan.com' },
    default: { name: 'wemixExplorer', url: 'https://testnet.wemixscan.com' },
  },
  testnet: true,
})
