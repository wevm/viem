import { describe, expect, test } from 'vitest'
import { scaleGasLimit } from './scaleGasLimit.js'

describe('scaleGasLimit', () => {
  test('scales the gas limit correctly', () => {
    const gasLimit: bigint = 1000n
    const expectedScaledGasLimit: bigint = (gasLimit * 12n) / 10n
    const scaledGasLimit = scaleGasLimit(gasLimit)

    expect(scaledGasLimit).toBe(expectedScaledGasLimit)
  })

  test('scales a gas limit of zero correctly', () => {
    const gasLimit: bigint = 0n
    const expectedScaledGasLimit: bigint = 0n
    const scaledGasLimit = scaleGasLimit(gasLimit)

    expect(scaledGasLimit).toBe(expectedScaledGasLimit)
  })

  test('handles large gas limit values correctly', () => {
    const gasLimit: bigint = 12345678901234567890n
    const expectedScaledGasLimit: bigint = (gasLimit * 12n) / 10n
    const scaledGasLimit = scaleGasLimit(gasLimit)

    expect(scaledGasLimit).toBe(expectedScaledGasLimit)
  })
})
