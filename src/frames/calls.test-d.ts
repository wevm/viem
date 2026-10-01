import { erc20Abi, parseAbi } from 'viem'
import { describe, expectTypeOf, test } from 'vitest'
import { accounts } from '~test/constants.js'
import type { TransactionRequestEIP8141 } from '../types/transaction.js'
import * as Frame from './Frame.js'

describe('calls', () => {
  test('calls accepts a readonly batch in transaction frames', () => {
    const batch = [{ to: accounts[0].address, value: 1n }] as const
    const request = {
      frames: [Frame.calls(batch)],
    } satisfies TransactionRequestEIP8141
    expectTypeOf(request.frames).toEqualTypeOf<
      ReturnType<typeof Frame.calls>[]
    >()
    // @ts-expect-error Call modes are assigned by the helper.
    Frame.calls([{ mode: 'verify' }])
    // @ts-expect-error Atomic flags are assigned by the helper.
    Frame.calls([{ flags: 'atomicBatch' }])
    // @ts-expect-error Calls must be a flat array.
    Frame.calls([[{ to: accounts[0].address }]])
  })

  test('infers each contract call independently', () => {
    const abi = parseAbi([
      'function setValue(uint256 value)',
      'function setValue(address value)',
      'function reset()',
    ])
    Frame.calls([
      {
        abi: erc20Abi,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        to: accounts[0].address,
      },
      { abi, functionName: 'setValue', args: [1n] },
      { abi, functionName: 'setValue', args: [accounts[0].address] },
      { abi, functionName: 'reset' },
      { data: '0x1234', executionGas: 1n, stateGas: 0n },
    ])

    // @ts-expect-error The function must exist in the ABI.
    Frame.calls([{ abi: erc20Abi, functionName: 'missing' }])
    Frame.calls([
      // @ts-expect-error Transfer requires an address and amount.
      { abi: erc20Abi, functionName: 'transfer', args: [accounts[0].address] },
    ])
    Frame.calls([
      {
        abi: erc20Abi,
        functionName: 'transfer',
        // @ts-expect-error The transfer amount must be a bigint.
        args: [accounts[0].address, '1'],
      },
    ])
    // @ts-expect-error Arguments cannot be omitted for transfer.
    Frame.calls([{ abi: erc20Abi, functionName: 'transfer' }])

    const batch = [
      {
        abi: erc20Abi,
        functionName: 'transfer',
        args: [accounts[1].address, 1n],
        to: accounts[0].address,
      },
    ] as const
    Frame.calls(batch)
    Frame.calls(batch.map((call) => ({ ...call, executionGas: 100n })))
  })
})
