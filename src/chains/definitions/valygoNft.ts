import { defineChain } from '../../utils/chain/defineChain.js'

export const valygoNft = defineChain({
  id: 7_773_777,
  name: 'VALYGO NFT',
  nativeCurrency: {
    decimals: 18,
    name: 'VYO',
    symbol: 'VYO',
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc-gw-1.vyoscan.com/ext/bc/2RyzsmGypNQZPby1miwMMV8spTvhgd9qd2peNRzU1mErUQqSSw/rpc',
        'https://rpc-gw-2.vyoscan.com/ext/bc/2RyzsmGypNQZPby1miwMMV8spTvhgd9qd2peNRzU1mErUQqSSw/rpc',
      ],
      webSocket: [
        'wss://ws.vyoscan.com/ext/bc/2RyzsmGypNQZPby1miwMMV8spTvhgd9qd2peNRzU1mErUQqSSw/ws',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'VYOScan NFT',
      url: 'https://nft.vyoscan.com',
      apiUrl: 'https://nft.vyoscan.com/api',
    },
  },
})
