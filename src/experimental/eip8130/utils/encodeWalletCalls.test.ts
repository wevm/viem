import { describe, expect, test } from 'vitest'
import { decodeFunctionData } from '../../../utils/abi/decodeFunctionData.js'
import { erc4337AccountAbi } from '../abis.js'
import type { AaCalls } from '../types/transaction.js'
import { encodeWalletCalls } from './encodeWalletCalls.js'

const account = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const
const to = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const

describe('encodeWalletCalls', () => {
  test('passes value-less phases through as `[to, data]`', () => {
    const calls: AaCalls = [[{ to, data: '0xdead' }, { to }]]
    expect(encodeWalletCalls({ account, calls })).toEqual([
      [
        { to, data: '0xdead' },
        { to, data: '0x' },
      ],
    ])
  })

  test('treats `value: 0n` as a plain call', () => {
    const calls: AaCalls = [[{ to, value: 0n, data: '0xbeef' }]]
    expect(encodeWalletCalls({ account, calls })).toEqual([
      [{ to, data: '0xbeef' }],
    ])
  })

  test('wraps a value-bearing phase into a single executeBatch self-call', () => {
    const calls: AaCalls = [[{ to, value: 1n, data: '0xbeef' }]]
    const [phase] = encodeWalletCalls({ account, calls })

    expect(phase).toHaveLength(1)
    expect(phase[0].to).toBe(account)

    const decoded = decodeFunctionData({
      abi: erc4337AccountAbi,
      data: phase[0].data!,
    })
    expect(decoded.functionName).toBe('executeBatch')
    expect(decoded.args).toEqual([[{ target: to, value: 1n, data: '0xbeef' }]])
  })

  test('collapses every call in a value-bearing phase (incl. value-less ones)', () => {
    const calls: AaCalls = [
      [
        { to, data: '0xaa' },
        { to, value: 5n, data: '0xbb' },
      ],
    ]
    const [phase] = encodeWalletCalls({ account, calls })

    expect(phase).toHaveLength(1)
    const decoded = decodeFunctionData({
      abi: erc4337AccountAbi,
      data: phase[0].data!,
    })
    expect(decoded.args).toEqual([
      [
        { target: to, value: 0n, data: '0xaa' },
        { target: to, value: 5n, data: '0xbb' },
      ],
    ])
  })

  test('decides wrapping per phase', () => {
    const calls: AaCalls = [
      [{ to, data: '0xaa' }],
      [{ to, value: 2n, data: '0xbb' }],
    ]
    const result = encodeWalletCalls({ account, calls })

    expect(result[0]).toEqual([{ to, data: '0xaa' }])
    expect(result[1]).toHaveLength(1)
    expect(result[1][0].to).toBe(account)
  })

  test('honors a custom `encodeExecute` override', () => {
    const calls: AaCalls = [[{ to, value: 9n, data: '0x1234' }]]
    const result = encodeWalletCalls({
      account,
      calls,
      encodeExecute: ({ calls }) => ({
        to: '0x000000000000000000000000000000000000dEaD',
        data: calls[0].data,
      }),
    })

    expect(result).toEqual([
      [{ to: '0x000000000000000000000000000000000000dEaD', data: '0x1234' }],
    ])
  })
})
