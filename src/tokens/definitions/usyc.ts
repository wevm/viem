import { defineToken } from '../defineToken.js'

/**
 * [USYC](https://developers.circle.com/tokenized/usyc/overview) token, with
 * canonical contract addresses across supported EVM chains.
 *
 * Pass to a Client's `tokens` array, call with a chain id to produce a
 * [token config](/tokens/guides/defining-tokens), or read the metadata and `addresses`
 * map directly.
 */
export const usyc = /*#__PURE__*/ defineToken({
  addresses: {
    1: '0x136471a34f6ef19fE571EFFC1CA711fdb8E49f2b', // mainnet
    56: '0x8D0fA28f221eB5735BC71d3a0Da67EE5bC821311', // bsc
    97: '0x109656Aba6F175c634c63C9874f29CeAAAB8E606', // bscTestnet
    5042002: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C', // arcTestnet
    11155111: '0x38D3A3f8717F4DB1CcB4Ad7D8C755919440848A3', // sepolia
  },
  currency: 'USD',
  decimals: 6,
  name: 'US Yield Coin',
  symbol: 'USYC',
})
