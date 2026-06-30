import { defineToken } from '../defineToken.js'

/**
 * [USDC](https://www.circle.com/usdc) token, with canonical contract addresses
 * across supported chains.
 *
 * Pass to a Client's `tokens` array, call with a chain id to produce a
 * [token config](/docs/chains/tokens), or read the metadata and `addresses`
 * map directly.
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { usdc } from 'viem/tokens'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   tokens: [usdc],
 *   transport: http(),
 * })
 * ```
 *
 * @example
 * ```ts
 * import { usdc } from 'viem/tokens'
 *
 * usdc.addresses[1]
 * // '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
 * ```
 */
export const usdc = /*#__PURE__*/ defineToken({
  addresses: {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // mainnet
    10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // optimism
    130: '0x078D782b760474a361dDA0AF3839290b0EF57AD6', // unichain
    137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // polygon
    146: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894', // sonic
    480: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1', // worldchain
    1301: '0x31d0220469e10c4E71834a79b1f276d740d3768F', // unichainSepolia
    1328: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED', // seiTestnet
    1329: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392', // sei
    4801: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88', // worldchainSepolia
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // base
    42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // arbitrum
    43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // avalancheFuji
    43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // avalanche
    57054: '0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6', // sonicBlazeTestnet
    57073: '0x2D270e6886d130D724215A266106e6832161EAEd', // ink
    59141: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7', // lineaSepolia
    59144: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // linea
    80002: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // polygonAmoy
    81224: '0xd996633a415985DBd7D6D12f4A4343E31f5037cf', // codex
    84532: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // baseSepolia
    421614: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // arbitrumSepolia
    763373: '0xFabab97dCE620294D2B0b0e46C68964e326300Ac', // inkSepolia
    812242: '0x6d7f141b6819C2c9CC2f818e6ad549E7Ca090F8f', // codexTestnet
    5042002: '0x3600000000000000000000000000000000000000', // arcTestnet
    11155111: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // sepolia
    11155420: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7', // optimismSepolia
  },
  currency: 'USD',
  decimals: 6,
  name: 'USD Coin',
  popular: true,
  symbol: 'USDC',
})
