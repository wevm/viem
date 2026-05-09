import { defineChain } from '../../utils/chain/defineChain.js'

export const metis = /*#__PURE__*/ defineChain({
  id: 1_088,
  name: 'Metis',
  nativeCurrency: {
    decimals: 18,
    name: 'Metis',
    symbol: 'METIS',
  },
  rpcUrls: {
    default: {
      http: [
        'https://metis.rpc.hypersync.xyz',
        'https://metis-pokt.nodies.app',
        'https://api.blockeden.xyz/metis/67nCBdZQSH9z3YqDDjdm',
        'https://metis-andromeda.rpc.thirdweb.com',
        'https://metis-andromeda.gateway.tenderly.co',
        'https://metis.api.onfinality.io/public',
        'https://andromeda.metis.io/?owner=1088',
        'https://metis-mainnet.public.blastapi.io',
      ],
      webSocket: ['wss://metis-rpc.publicnode.com', 'wss://metis.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Metis Explorer',
      url: 'https://explorer.metis.io',
      apiUrl:
        'https://api.routescan.io/v2/network/mainnet/evm/1088/etherscan/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 2338552,
    },
  },
})
