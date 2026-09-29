import { privateKeyToAccount } from 'viem/accounts'
import { Frame } from 'viem/frames'
import { expect, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { prepare } from './prepare.js'

const account = privateKeyToAccount(accounts[0].privateKey)
const sponsor = privateKeyToAccount(accounts[1].privateKey)

test('prepends execution and payment approval', () => {
  const transaction = {
    frames: [Frame.calls([{ to: sponsor.address, value: 1n }])],
  }
  const result = prepare(transaction, account)

  expect(result.frames[0]).toMatchObject({
    flags: 'approveExecutionAndPayment',
    mode: 'verify',
    to: account.address,
  })
  expect(result.frames[1]).toMatchObject({
    mode: 'sender',
    to: sponsor.address,
    value: 1n,
  })
  expect(transaction.frames).toHaveLength(1)
  expect(prepare(result, account).frames).toHaveLength(2)
})

test('payment approval does not suppress execution approval', () => {
  const result = prepare(
    {
      frames: [
        Frame.from(() => ({
          frame: {
            flags: 'approvePayment',
            mode: 'verify',
            to: sponsor.address,
          },
          signatures: [
            {
              scheme: 'secp256k1',
              signer: sponsor.address,
              async sign({ hash }) {
                return sponsor.sign({ hash })
              },
            },
          ],
        })),
      ],
    },
    account,
  )

  expect(result.frames[0]).toMatchObject({
    flags: 'approveExecution',
    to: account.address,
  })
  expect(result.frames[1]).toMatchObject({
    flags: 'approvePayment',
    to: sponsor.address,
  })
})

test.each(['approveExecution', 'approveExecutionAndPayment', 2, 3] as const)(
  'preserves explicit execution approval: %s',
  (flags) => {
    const transaction = { frames: [{ flags, mode: 'verify' as const }] }
    expect(prepare(transaction, account)).toEqual({
      ...transaction,
      nonceKeys: [0n],
    })
  },
)

test('a verify frame without execution approval does not suppress it', () => {
  const transaction = { frames: [{ mode: 'verify' as const }] }
  expect(prepare(transaction, account).frames).toHaveLength(2)
})

test('does not alter ordinary transactions', () => {
  const transaction = { frames: undefined }
  expect(prepare(transaction, undefined)).toBe(transaction)
})

test('requires explicit verification for an account address', () => {
  expect(() =>
    prepare(
      { frames: [Frame.calls([{ to: sponsor.address }])] },
      account.address,
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    [BaseError: Cannot add verification automatically for this account.

    Pass an account created with \`privateKeyToAccount\` as the transaction account, or add a verification frame with \`mode: 'verify'\` and \`flags: 'approveExecution'\` or \`'approveExecutionAndPayment'\`.

    Version: viem@x.y.z]
  `)
})

test('preserves raw frames with explicit signature entries', () => {
  const transaction = {
    frames: [{ mode: 'sender' as const, to: sponsor.address }],
    signatures: [{ scheme: 'secp256k1' as const }],
  }
  expect(prepare(transaction, account.address)).toEqual({
    ...transaction,
    nonceKeys: [0n],
  })
  expect(prepare(transaction, account)).toEqual({
    ...transaction,
    nonceKeys: [0n],
  })
})

test('recognizes custom verification before inserting default verification', () => {
  const frame = Frame.from(({ signatureIndex }) => {
    return {
      frame: {
        mode: 'verify',
        flags: 'approveExecutionAndPayment',
        data: signatureIndex === 0 ? '0x00' : '0xff',
      },
    }
  })
  const prepared = prepare({ frames: [frame] }, account.address)
  expect(prepared.frames).toHaveLength(1)
  expect(prepared.frames[0]?.data).toBe('0x00')
})

test('reallocates custom entries after automatic verification is inserted', () => {
  const frame = Frame.from(({ signatureIndex }) => {
    return {
      frame: { mode: 'sender', data: signatureIndex === 1 ? '0x01' : '0x00' },
      signatures: [
        {
          scheme: 'arbitrary',
          async sign() {
            return '0xaa'
          },
        },
      ],
    }
  })
  const prepared = prepare({ frames: [frame] }, account)
  expect(prepared.frames).toHaveLength(2)
  expect(prepared.frames[1]?.data).toBe('0x01')
})

test('detects payment approval declared only during custom preparation', () => {
  const payer = Frame.from(() => {
    return {
      frame: { mode: 'verify', flags: 'approvePayment', to: sponsor.address },
    }
  })
  const verifier = Frame.verify({ account })
  expect(verifier).not.toHaveProperty('flags')
  expect(payer).not.toHaveProperty('flags')
  const prepared = prepare({ frames: [verifier, payer] }, account)
  expect(prepared.frames.map(({ flags }) => flags)).toEqual([
    'approveExecution',
    'approvePayment',
  ])
  const automatic = prepare({ frames: [payer] }, account)
  expect(automatic.frames.map(({ flags }) => flags)).toEqual([
    'approveExecution',
    'approvePayment',
  ])
})

test('inserts automatic verification after expiry', () => {
  const transaction = {
    frames: [
      Frame.expiry(1_800_000_000),
      Frame.from(() => ({
        frame: { flags: 'approvePayment', mode: 'verify', to: sponsor.address },
        signatures: [
          {
            scheme: 'secp256k1',
            signer: sponsor.address,
            async sign({ hash }) {
              return sponsor.sign({ hash })
            },
          },
        ],
      })),
      Frame.calls([{ to: sponsor.address, value: 1n }]),
    ],
  }
  const prepared = prepare(transaction, account)

  expect(prepared.frames.map(({ flags }) => flags)).toEqual([
    'none',
    'approveExecution',
    'approvePayment',
    undefined,
  ])
  expect(prepared.frames[0]?.to).toBe(
    '0x0000000000000000000000000000000000008141',
  )
  expect(prepared.frames[1]?.to).toBe(account.address)
  expect(prepare(prepared, account).frames).toHaveLength(4)
  expect(transaction.frames).toHaveLength(3)
})
