import * as Token from '../../core/Token.js'

/**
 * [cirBTC](https://www.circle.com/cirbtc) token, with canonical contract
 * addresses across supported EVM chains.
 *
 * Pass to a Client's `tokens` array, call with a chain id to produce a
 * token config, or read the metadata and `addresses`
 * map directly.
 */
export const cirbtc = /*#__PURE__*/ Token.from({
  addresses: {
    1: '0x72DFB2E44f59C5AD2bAFE84314E5b99a7cd5075E', // mainnet
    5042002: '0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF', // arcTestnet
    11155111: '0x3a3fe695F684Bf9b9e43CF43C2b895Ea5e392bB3', // sepolia
  },
  currency: 'BTC',
  decimals: 8,
  name: 'Circle Wrapped Bitcoin',
  symbol: 'cirBTC',
})
