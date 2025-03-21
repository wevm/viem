import { defineChain } from '../../utils/chain/defineChain.js'

export const monadTestnet = /*#__PURE__*/ defineChain({
  id: 10_143,
  network: 'monad-testnet',
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Testnet MON Token',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.xyz',
      apiUrl: 'https://sourcify-api-monad.blockvision.org',
    },
    etherscan: {
      name: 'MonadScan',
      url: 'https://testnet.monadscan.com/',
      apiUrl: 'https://api-testnet.monadscan.com/api',
    },
    socialscan: {
      name: 'Monad SocialScan',
      url: 'https://monad-testnet.socialscan.io/',
      apiUrl:
        'https://api.socialscan.io/monad-testnet/v1/explorer/command_api/contract',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 251449,
    },
  },
  testnet: true,
})
