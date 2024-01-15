import { defineChain } from '../../utils/chain/defineChain.js'

export const astarZkatana = /*#__PURE__*/ defineChain({
  id: 1_261_120,
  name: 'Astar zkEVM Testnet zKatana',
  network: 'zKatana',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.zkatana.gelato.digital',
        'https://rpc.startale.com/zkatana',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'zKatana Explorer',
      url: 'https://zkatana.explorer.startale.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 31317,
    },
  },
  testnet: true,
})
