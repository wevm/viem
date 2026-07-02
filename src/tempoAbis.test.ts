import { describe, expect, test } from 'vitest'
import { decodeFunctionData, encodeFunctionData, getAbiItem } from './index.js'
import { Abis, Addresses } from './tempo/index.js'

describe('tempo storageCredits', () => {
  test('exports the TIP-1060 precompile address', () => {
    expect(Addresses.storageCredits).toBe(
      '0x1060000000000000000000000000000000000000',
    )
  })

  test('exports the TIP-1060 precompile ABI', () => {
    expect(
      getAbiItem({
        abi: Abis.storageCredits,
        name: 'balanceOf',
      }),
    ).toBeDefined()
  })

  test('encodes and decodes storage credit calldata', () => {
    const data = encodeFunctionData({
      abi: Abis.storageCredits,
      functionName: 'setBudget',
      args: [12n],
    })

    const decoded = decodeFunctionData({
      abi: Abis.storageCredits,
      data,
    })

    expect(decoded.functionName).toBe('setBudget')
    expect(decoded.args[0]).toBe(12n)
  })
})
