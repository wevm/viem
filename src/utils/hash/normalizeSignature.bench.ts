import { bench, describe } from 'vitest'

import { normalizeSignature } from './normalizeSignature.js'

describe('Normalize Signature', () => {
  bench('viem: `normalizeSignature`', () => {
    normalizeSignature(
      'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
    )
  })
})
