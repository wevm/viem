import { createClient, decodeFunctionData, erc20Abi, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import * as FrameAfterFill from './internal/afterFill.js'
import * as FramePrepare from './internal/prepare.js'
import * as FrameTransaction from './internal/transaction.js'

const account = privateKeyToAccount(`0x${'01'.padStart(64, '0')}`)
const contractAddress = '0x0000000000000000000000000000000000000002'
const token = '0x0000000000000000000000000000000000000003'
const request = {
  chainId: 8141,
  sender: account.address,
  nonce: 0,
  maxFeePerGas: 1n,
  maxPriorityFeePerGas: 0n,
}

describe('fee', () => {
  test('expands payment approval and reimbursement together', () => {
    const prepared = FramePrepare.prepare(
      {
        ...request,
        frames: [Frame.fee({ payer: account, contractAddress, token })],
      },
      account,
    )
    expect(
      prepared.frames.map((frame) => {
        const { mode, flags, to } = frame
        return { mode, flags, to }
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "flags": "approveExecution",
          "mode": "verify",
          "to": "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
        },
        {
          "flags": "approvePayment",
          "mode": "verify",
          "to": "0x0000000000000000000000000000000000000002",
        },
        {
          "flags": undefined,
          "mode": "sender",
          "to": "0x0000000000000000000000000000000000000003",
        },
      ]
    `)
    expect(
      decodeFunctionData({ abi: erc20Abi, data: prepared.frames[2]!.data! }),
    ).toMatchInlineSnapshot(`
      {
        "args": [
          "0x0000000000000000000000000000000000000002",
          1n,
        ],
        "functionName": "transfer",
      }
    `)
    expect(prepared.signatures).toMatchInlineSnapshot(`
      [
        {
          "scheme": "secp256k1",
          "signer": "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
        },
        {
          "scheme": "secp256k1",
          "signer": "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
        },
      ]
    `)
  })

  test('defaults payer authentication to the transaction account', () => {
    const prepared = FramePrepare.prepare(
      { ...request, frames: [Frame.fee({ contractAddress, token })] },
      account,
    )
    expect(prepared.signatures).toMatchInlineSnapshot(`
      [
        {
          "scheme": "secp256k1",
          "signer": "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
        },
        {
          "scheme": "secp256k1",
          "signer": "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
        },
      ]
    `)
    expect(prepared.frames.map((frame) => frame.to)).toMatchInlineSnapshot(`
      [
        "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000003",
      ]
    `)
  })

  test('retains a resolved signing group when adding sender verification', () => {
    const initial = FrameTransaction.resolve({
      ...request,
      account,
      frames: [Frame.fee({ contractAddress, token })],
    })
    const prepared = FramePrepare.prepare(initial, account)
    expect(prepared.frames).toHaveLength(3)
    expect(prepared.signatures).toHaveLength(2)
    expect(prepared.frameContext?.entries[1]?.afterFill).toBeTypeOf('function')
    expect(prepared.frameContext?.entries[1]?.signatures[0]?.sign).toBeTypeOf(
      'function',
    )
  })

  test('requires a signing account when payer is omitted', () => {
    expect(() =>
      FramePrepare.prepare(
        { frames: [Frame.fee({ contractAddress, token })] },
        account.address,
      ),
    ).toThrow(
      'Frame.fee: `payer` or the transaction `account` must provide a signing function.',
    )
  })

  test('requires canonical signature payloads', () => {
    expect(() =>
      FramePrepare.prepare(
        {
          frames: [
            Frame.fee({
              contractAddress,
              token,
              payer: {
                scheme: 'secp256k1',
                signer: account.address,
                payload: `0x${'11'.repeat(32)}`,
                sign: account.sign,
              },
            }),
          ],
        },
        account,
      ),
    ).toThrow(
      'Frame.fee: payer signatures must use the canonical transaction hash; `payload` must be omitted or "0x".',
    )
  })

  test('requires a finalized quote before signing', async () => {
    const prepared = FramePrepare.prepare(
      {
        ...request,
        frames: [Frame.fee({ payer: account, contractAddress, token })],
      },
      account,
    )
    const transaction = {
      ...prepared,
      frames: prepared.frames.map((frame) => ({
        ...frame,
        executionGas: 50000n,
        stateGas: 0n,
      })),
    }
    await expect(
      Frame.sign(transaction.frames[1]!, { transaction }),
    ).rejects.toThrow(
      'Frame.fee: transaction hash does not match the finalized fee quote. Call `prepareTransactionRequest` before signing.',
    )
  })

  test('rejects duplicate fees before requesting a quote', async () => {
    const prepared = FramePrepare.prepare(
      {
        ...request,
        frames: [
          Frame.fee({ payer: account, contractAddress, token }),
          Frame.fee({ payer: account, contractAddress, token }),
        ],
      },
      account,
    )
    const transaction = {
      ...prepared,
      frames: prepared.frames.map((frame) => ({
        ...frame,
        executionGas: 50000n,
        stateGas: 0n,
      })),
    }
    await expect(
      FrameAfterFill.afterFill(
        createClient({ transport: http('http://127.0.0.1:1') }),
        transaction,
        prepared.frames,
      ),
    ).rejects.toThrow(
      'Frame.fee: a transaction must contain exactly one fee group.',
    )
  })
})
