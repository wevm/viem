import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expectTypeOf, test } from 'vitest'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../accounts/privateKeyToAccount.js'
import type { PrivateKeyAccount } from '../accounts/types.js'
import type { FrameSignature, Frame as FrameType } from '../types/frame.js'
import type {
  TransactionRequest,
  TransactionRequestEIP8141,
  TransactionSerializable,
  TransactionSerializableGeneric,
} from '../types/transaction.js'
import * as Frame from './Frame.js'
import * as FrameTransaction from './internal/transaction.js'

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
  Frame.from((options) => {
    const { signatureIndex } = options

    expectTypeOf(signatureIndex).toEqualTypeOf<number>()
    return {
      frame: { mode: 'default' },
      signatures: [
        {
          scheme: 'arbitrary',
          async sign(options) {
            const { hash, signatureIndex } = options

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

test('arbitrary signatures accept simulation placeholders', () => {
  const signature = {
    scheme: 'arbitrary',
    placeholder: '0xaabb',
    sign: async () => '0xccdd',
  } satisfies Frame.Signature
  expectTypeOf(signature.placeholder).toEqualTypeOf<'0xaabb'>()

  const native: Frame.Signature = {
    scheme: 'secp256k1',
    // @ts-expect-error Native schemes use unsigned estimation without a placeholder.
    placeholder: '0xaabb',
    sign: async () => '0xccdd',
  }
  void native
})

test('names and post-fill hooks are returned with frame definitions', () => {
  Frame.from((options) => {
    const { entries, signatureIndex } = options

    expectTypeOf(entries).toEqualTypeOf<readonly Frame.Entry[]>()
    expectTypeOf(signatureIndex).toEqualTypeOf<number>()
    return {
      name: 'custom',
      frame: { mode: 'sender' },
      async afterFill(options) {
        const { entries, frameIndex, transaction } = options

        expectTypeOf(entries).toEqualTypeOf<readonly Frame.Entry[]>()
        expectTypeOf(frameIndex).toEqualTypeOf<number>()
        expectTypeOf(transaction.frameContext).toEqualTypeOf<
          Frame.Context | undefined
        >()
        return { frames: [{ index: frameIndex, data: '0x12' }] }
      },
    }
  })
})

test('sign returns a signed frame accepted in transaction frames', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  const request = FrameTransaction.resolve({
    account,
    chainId: 8141,
    sender: account.address,
    frames: [Frame.verify({ account })],
    label: 'payment' as const,
  })
  const result = await Frame.sign(request.frames[0]!, { transaction: request })
  expectTypeOf(result).toEqualTypeOf<Frame.Signed>()
  account.signTransaction({ ...request, frames: [result] })
})

test('definition functions are accepted as inputs and preparation returns protocol frames', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  const client = createWalletClient({
    account,
    chain: mainnet,
    transport: http(),
  })
  const definition: Frame.Frame = () => ({
    frame: { mode: 'sender', value: 1n },
  })
  expectTypeOf(Frame.from(definition)).toEqualTypeOf<Frame.Frame>()
  const request = await client.prepareTransactionRequest({
    frames: [definition],
  })
  expectTypeOf(request.frames).toEqualTypeOf<readonly FrameType[]>()
  const { gas: _, ...transaction } = request
  account.signTransaction({ ...transaction, chainId: 8141 })
})

test('frame context is excluded from public transaction types', () => {
  expectTypeOf<
    'frameContext' extends keyof TransactionRequest ? true : false
  >().toEqualTypeOf<false>()
  expectTypeOf<
    'frameContext' extends keyof TransactionSerializable ? true : false
  >().toEqualTypeOf<false>()
  expectTypeOf<
    'frameContext' extends keyof TransactionSerializableGeneric ? true : false
  >().toEqualTypeOf<false>()
})

test('data suffix hook receives protocol frames and returns a suffix', () => {
  Frame.from(() => ({
    frame: { mode: 'sender' },
    dataSuffix(context) {
      expectTypeOf(context.frame).toEqualTypeOf<FrameType>()
      expectTypeOf(context.index).toEqualTypeOf<number>()
      expectTypeOf(context.suffix).toEqualTypeOf<`0x${string}`>()
      return context.suffix
    },
  }))
})
