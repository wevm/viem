import { erc20Abi, numberToHex, parseTransaction } from 'viem'
import { expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import * as Frame from './Frame.js'
import { resolve } from './internal/transaction.js'

const account = privateKeyToAccount(accounts[0].privateKey)

test('preserves group boundaries and call inputs', () => {
  const call = {
    to: account.address,
    value: 1n,
    executionGas: 50_000n,
    stateGas: 0n,
  } as const
  const groups = [[call, call], [call], [call, call, call]] as const
  const prepared = resolve({
    frames: groups.map((batch) => Frame.calls(batch)),
  })
  expect(prepared.frames.map(({ flags }) => flags)).toEqual([
    'atomicBatch',
    undefined,
    undefined,
    'atomicBatch',
    'atomicBatch',
    undefined,
  ])
  expect(prepared.frames.every((frame) => frame.mode === 'sender')).toBe(true)
  expect(prepared.frames[0]).toMatchObject(call)
  expect(call).not.toHaveProperty('flags')
  expect(resolve(prepared)).toBe(prepared)
})

test.each([
  { batch: [] },
  { batch: null },
  { batch: [null] },
  { batch: [1] },
  { batch: [[{ to: account.address }]] },
  { batch: [{ mode: 'verify', to: account.address }] },
  { batch: [{ flags: 'approvePayment', to: account.address }] },
  { batch: [Frame.verify({ account })] },
  { batch: [Frame.calls([{ to: account.address }])] },
])('rejects invalid batch: $batch', ({ batch }) => {
  expect(() => resolve({ frames: [Frame.calls(batch as never)] })).toThrow()
})

test('expands calls before allocating following signatures', async () => {
  const prepared = resolve({
    chainId: 8141,
    maxFeePerGas: 20n,
    maxPriorityFeePerGas: 1n,
    nonce: 0,
    sender: account.address,
    frames: [
      Frame.verify({ account, executionGas: 50_000n, stateGas: 0n }),
      Frame.calls([
        { to: account.address, executionGas: 100n, stateGas: 0n },
        { to: account.address, executionGas: 100n, stateGas: 0n },
      ]),
      Frame.from(({ signatureIndex }) => ({
        frame: {
          mode: 'default',
          data: numberToHex(signatureIndex, { size: 1 }),
          executionGas: 100n,
          stateGas: 0n,
        },
        signatures: [
          {
            scheme: 'arbitrary',
            async sign({ signatureIndex }) {
              return numberToHex(signatureIndex, { size: 1 })
            },
          },
        ],
      })),
    ],
  })
  expect(prepared.frames).toHaveLength(4)
  expect(prepared.frames[3]?.data).toBe('0x01')
  const serialized = await account.signTransaction(prepared)
  expect(parseTransaction(serialized).signatures?.[1]).toMatchObject({
    scheme: 'arbitrary',
    signature: '0x01',
  })
})

test('encodes ABI calls alongside raw calldata without leaking ABI fields', () => {
  const recipient = '0x0000000000000000000000000000000000000002'
  const prepared = resolve({
    frames: [
      Frame.calls([
        {
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipient, 1n],
          to: account.address,
          executionGas: 50_000n,
          stateGas: 10_000n,
        },
        { to: recipient, data: '0x1234', value: 2n },
      ]),
    ],
  })

  expect(prepared.frames).toEqual([
    {
      to: account.address,
      data: '0xa9059cbb00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001',
      executionGas: 50_000n,
      stateGas: 10_000n,
      flags: 'atomicBatch',
      mode: 'sender',
    },
    { to: recipient, data: '0x1234', value: 2n, mode: 'sender' },
  ])
})

test('uses ABI calldata and appends a data suffix', () => {
  const prepared = resolve({
    frames: [
      Frame.calls([
        {
          abi: erc20Abi,
          functionName: 'totalSupply',
          to: account.address,
          data: '0xdead',
          dataSuffix: '0xbeef',
        },
        { to: account.address, data: '0x1234', dataSuffix: '0xabcd' },
      ]),
    ],
  })

  expect(prepared.frames.map(({ data }) => data)).toEqual([
    '0x18160dddbeef',
    '0x1234abcd',
  ])
})

test('rejects ABI arguments that cannot be encoded', () => {
  const batch = [
    { abi: erc20Abi, functionName: 'transfer', args: [account.address] },
  ]

  expect(() => resolve({ frames: [Frame.calls(batch as never)] })).toThrow()
})
