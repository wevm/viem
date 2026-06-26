import type { Address } from 'abitype'
import { arbitrum } from '../chains/definitions/arbitrum.js'
import { arbitrumSepolia } from '../chains/definitions/arbitrumSepolia.js'
import { arcTestnet } from '../chains/definitions/arcTestnet.js'
import { avalanche } from '../chains/definitions/avalanche.js'
import { avalancheFuji } from '../chains/definitions/avalancheFuji.js'
import { base } from '../chains/definitions/base.js'
import { baseSepolia } from '../chains/definitions/baseSepolia.js'
import { codex } from '../chains/definitions/codex.js'
import { codexTestnet } from '../chains/definitions/codexTestnet.js'
import { ink } from '../chains/definitions/ink.js'
import { inkSepolia } from '../chains/definitions/inkSepolia.js'
import { linea } from '../chains/definitions/linea.js'
import { lineaSepolia } from '../chains/definitions/lineaSepolia.js'
import { mainnet } from '../chains/definitions/mainnet.js'
import { optimism } from '../chains/definitions/optimism.js'
import { optimismSepolia } from '../chains/definitions/optimismSepolia.js'
import { polygon } from '../chains/definitions/polygon.js'
import { polygonAmoy } from '../chains/definitions/polygonAmoy.js'
import { sei } from '../chains/definitions/sei.js'
import { seiTestnet } from '../chains/definitions/seiTestnet.js'
import { sepolia } from '../chains/definitions/sepolia.js'
import { sonic } from '../chains/definitions/sonic.js'
import { sonicBlazeTestnet } from '../chains/definitions/sonicBlazeTestnet.js'
import { unichain } from '../chains/definitions/unichain.js'
import { unichainSepolia } from '../chains/definitions/unichainSepolia.js'
import { worldchain } from '../chains/definitions/worldchain.js'
import { worldchainSepolia } from '../chains/definitions/worldchainSepolia.js'

/**
 * USDC token addresses, keyed by chain id.
 *
 * @example
 * ```ts
 * import { mainnet } from 'viem/chains'
 * import { Addresses } from 'viem/tokens'
 *
 * Addresses.usdc[mainnet.id]
 * // '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
 * ```
 */
export const usdc = {
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [arbitrumSepolia.id]: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  [arcTestnet.id]: '0x3600000000000000000000000000000000000000',
  [avalanche.id]: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  [avalancheFuji.id]: '0x5425890298aed601595a70AB815c96711a31Bc65',
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  [codex.id]: '0xd996633a415985DBd7D6D12f4A4343E31f5037cf',
  [codexTestnet.id]: '0x6d7f141b6819C2c9CC2f818e6ad549E7Ca090F8f',
  [ink.id]: '0x2D270e6886d130D724215A266106e6832161EAEd',
  [inkSepolia.id]: '0xFabab97dCE620294D2B0b0e46C68964e326300Ac',
  [linea.id]: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  [lineaSepolia.id]: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7',
  [mainnet.id]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  [optimism.id]: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  [optimismSepolia.id]: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  [polygon.id]: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  [polygonAmoy.id]: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  [sei.id]: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
  [seiTestnet.id]: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  [sonic.id]: '0x29219dd400f2Bf60E5a23d13Be72B486D4038894',
  [sonicBlazeTestnet.id]: '0xA4879Fed32Ecbef99399e5cbC247E533421C4eC6',
  [unichain.id]: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
  [unichainSepolia.id]: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
  [worldchain.id]: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
  [worldchainSepolia.id]: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88',
} as const satisfies Record<number, Address>
