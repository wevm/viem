import { expectTypeOf, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import type { PrivateKeyAccount } from '../accounts/types.js'
import type { FrameSignature } from '../types/frame.js'
import type { TransactionRequestEIP8141 } from '../types/transaction.js'
import * as Frame from './Frame.js'

test('accounts belong to frame helpers, not signature entries', () => {
  expectTypeOf<
    NonNullable<TransactionRequestEIP8141['signatures']>[number]
  >().toEqualTypeOf<FrameSignature>()
  expectTypeOf<PrivateKeyAccount>().not.toExtend<FrameSignature>()

  const account = privateKeyToAccount(accounts[0].privateKey)
  const request = {
    frames: [Frame.verify({ account })],
  } satisfies TransactionRequestEIP8141

  account.signTransaction({ ...request, chainId: 1, sender: account.address })
})

test('preparation and signing receive a definite signature index', () => {
  Frame.from(({ signatureIndex }) => {
    expectTypeOf(signatureIndex).toEqualTypeOf<number>()
    return {
      frame: { mode: 'default' },
      signatures: [
        {
          scheme: 'arbitrary',
          async sign({ hash, signatureIndex }) {
            expectTypeOf(hash).toEqualTypeOf<`0x${string}`>()
            expectTypeOf(signatureIndex).toEqualTypeOf<number>()
            return '0xaa'
          },
        },
      ],
    }
  })
  Frame.from(() => ({ frame: { mode: 'sender' } }))
})

test('from accepts multiple readonly frames', () => {
  Frame.from(() => ({ frames: [{ mode: 'sender' }] as const }))
  // @ts-expect-error A definition returns either one frame or multiple frames.
  Frame.from(() => ({ frame: { mode: 'sender' }, frames: [] }))
})
