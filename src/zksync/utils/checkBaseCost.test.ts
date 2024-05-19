import { describe, expect, test } from 'vitest'
import { checkBaseCost } from './checkBaseCost.js'

describe('checkBaseCost', () => {
  test('throws an error if baseCost is greater than the provided value (bigint)', async () => {
    const baseCost = BigInt(100)
    const value = BigInt(50)

    await expect(checkBaseCost(baseCost, value)).rejects.toThrow(
      'The base cost of performing the priority operation is higher than the provided value.',
    )
  })

  test('does not throw an error if baseCost is less than or equal to the provided value (bigint)', async () => {
    const baseCost = BigInt(50)
    const value = BigInt(100)

    await expect(checkBaseCost(baseCost, value)).resolves.toBeUndefined()
  })

  test('does not throw an error if baseCost is less than or equal to the provided value (Promise<bigint>)', async () => {
    const baseCost = BigInt(50)
    const value = Promise.resolve(BigInt(100))

    await expect(checkBaseCost(baseCost, value)).resolves.toBeUndefined()
  })
})
