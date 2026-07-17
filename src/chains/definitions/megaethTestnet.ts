import * as Chain from '../../core/Chain.js'

export const megaethTestnet = /*#__PURE__*/ Chain.from({
  id: 6343,
  blockTime: 1_000,
  name: 'MegaETH Testnet',
  nativeCurrency: {
    name: 'MegaETH Testnet Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://carrot.megaeth.com/rpc',
    ws: 'wss://carrot.megaeth.com/ws',
  },
  blockExplorers: {
    name: 'Etherscan',
    url: 'https://testnet-mega.etherscan.io',
    apiUrl: 'https://api.etherscan.io/v2/api',
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
