import { expect, test } from 'vitest'
import { getBaseCostFromFeeData } from './getBaseCostFromFeeData.js'

test('getBaseCostFromFeeData', () => {
  const feeData = {
    maxFeePerGas: 100n,
    maxPriorityFeePerGas: 20n,
  }

  const baseCost = getBaseCostFromFeeData(feeData)
  expect(baseCost).toBe(40n)
})
