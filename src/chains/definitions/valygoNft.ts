import * as Chain from '../../core/Chain.js'

export const valygoNft = Chain.from({
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
  contracts: {
    multicall3: {
      address: '0x4469693a04BAE365795329a89b24F4Eb1303Ea08',
    },
  },
})
