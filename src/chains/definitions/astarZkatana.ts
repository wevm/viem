import { defineChain } from '../../utils/chain.js'

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
    public: {
      http: [
        'https://rpc.zkatana.gelato.digital',
        'https://rpc.startale.com/zkatana',
      ],
    },
  },
  blockExplorers: {
    blockscout: {
      name: 'Blockscout zKatana chain explorer',
      url: 'https://zkatana.blockscout.com',
    },
    default: {
      name: 'zKatana Explorer',
      url: 'https://zkatana.explorer.startale.com/',
    },
  },
  testnet: true,
})
