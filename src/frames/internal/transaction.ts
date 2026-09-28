import * as FrameSignature_ox from 'ox/FrameSignature'
import * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import { BaseError } from '../../errors/base.js'
import type { Frame, FrameSignature } from '../../types/frame.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionSerializableEIP8141 } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'

export const expiryVerifier = '0x0000000000000000000000000000000000008141'

export const signing = Symbol('frameSigning')

export type Signature = UnionOmit<FrameSignature, 'signature'> & {
  /** Signs this entry after transaction preparation is complete. */
  sign: (parameters: {
    hash: Hex
    /** This entry's allocated transaction signature index. */
    signatureIndex: number
    transaction: Transaction
  }) => Promise<NonNullable<FrameSignature['signature']>>
}

/** Prepares a signing frame or expands into multiple unsigned frames. */
export type Definition = (parameters: {
  /** Frames in transaction order. Signing frame preparation runs again after expansion. */
  frames: readonly Frame[]
  /** First signature slot allocated to this frame. */
  signatureIndex: number
}) =>
  | {
      frame: Frame
      frames?: never
      signatures?: readonly Signature[] | undefined
    }
  | {
      frames: readonly Frame[]
      frame?: never
      signatures?: never
    }

export type SigningFrame = Frame & {
  [signing]?:
    | {
        prepare: Definition
        hash?: Hex | undefined
        prepared?:
          | {
              signatureIndex: number
              signatures: readonly Signature[]
            }
          | undefined
        signedSignatures?: readonly FrameSignature[] | undefined
      }
    | undefined
}

export type Transaction = TransactionSerializableEIP8141

export function resolve<
  transaction extends {
    frames?: readonly Frame[] | undefined
    signatures?: Transaction['signatures'] | undefined
  },
>(transaction: transaction): transaction {
  const frames = transaction.frames as readonly SigningFrame[] | undefined
  if (!frames?.some((frame) => frame[signing])) return transaction

  const signed = frames.filter((frame) => frame[signing]?.hash)
  const signatures: FrameSignature[] = []
  const fresh = new Set<SigningFrame>()
  const resolvedFrames = frames.flatMap(
    (frame): SigningFrame | readonly SigningFrame[] => {
      const state = frame[signing]
      if (!state) return frame

      const signatureIndex = signatures.length
      const prepared =
        state.prepared?.signatureIndex === signatureIndex || signed.length
          ? { frame, signatures: state.prepared?.signatures ?? [] }
          : state.prepare({ frames, signatureIndex })
      if (prepared.frames) {
        if (prepared.frames.some((frame) => (frame as SigningFrame)[signing]))
          throw new BaseError(
            'Frame expansions must contain explicit frames, not builders.',
          )
        return prepared.frames
      }

      const entries = prepared.signatures ?? []
      if (entries.some((entry) => typeof entry.sign !== 'function'))
        throw new BaseError(
          'Each prepared signature entry must provide a sign callback.',
        )

      signatures.push(...(state.signedSignatures ?? entries.map(toSignature)))
      const resolved: SigningFrame = {
        ...prepared.frame,
        [signing]: {
          ...state,
          prepared: { signatureIndex, signatures: entries },
        },
      }
      if (state.prepared?.signatureIndex !== signatureIndex) fresh.add(resolved)

      return resolved
    },
  )

  // Resolve peer-dependent fields after every helper has declared its frame and signature slots.
  const preparedFrames = [...resolvedFrames]
  if (!signed.length)
    for (const [index, frame] of preparedFrames.entries()) {
      const state = frame[signing]
      if (!state?.prepared || !fresh.has(frame)) continue

      const prepared = state.prepare({
        frames: preparedFrames,
        signatureIndex: state.prepared.signatureIndex,
      })
      if (prepared.frames)
        throw new BaseError('Frame preparation must preserve its return shape.')

      if (
        prepared.signatures?.some((entry) => typeof entry.sign !== 'function')
      )
        throw new BaseError(
          'Each prepared signature entry must provide a sign callback.',
        )

      if (
        JSON.stringify(
          (prepared.signatures ?? []).map((entry) =>
            FrameSignature_ox.toRpc(toSignature(entry)),
          ),
        ) !==
        JSON.stringify(
          state.prepared.signatures.map((entry) =>
            FrameSignature_ox.toRpc(toSignature(entry)),
          ),
        )
      )
        throw new BaseError(
          'Frame preparation must preserve the allocated signature entries.',
        )

      resolvedFrames[index] = {
        ...prepared.frame,
        [signing]: {
          ...state,
          prepared: {
            ...state.prepared,
            signatures: prepared.signatures ?? [],
          },
        },
      }
    }

  if (
    resolvedFrames.some(
      (frame, index) =>
        index > 0 &&
        (frame.mode === 'verify' || frame.mode === 1) &&
        frame.to?.toLowerCase() === expiryVerifier,
    )
  )
    throw new BaseError('An expiry frame must be first and appear only once.')

  if (!resolvedFrames.some((frame) => frame[signing]))
    return { ...transaction, frames: resolvedFrames }

  if (
    transaction.signatures?.some((entry, index) => {
      const expectedEntry = signatures[index]
      if (!expectedEntry) return true

      const actual = FrameSignature_ox.toRpc(entry)
      const expected = FrameSignature_ox.toRpc(expectedEntry)

      return (
        actual.scheme !== expected.scheme ||
        actual.signer?.toLowerCase() !== expected.signer?.toLowerCase() ||
        actual.msg !== expected.msg ||
        (actual.signature !== undefined &&
          actual.signature !== '0x' &&
          actual.signature !== expected.signature)
      )
    })
  )
    throw new BaseError(
      'Provide signatures through the signing frames, not the transaction signatures array.',
    )

  const result = { ...transaction, frames: resolvedFrames, signatures }
  if (signed.length) {
    const hash = getHash(result as unknown as Transaction)
    if (signed.some((frame) => frame[signing]?.hash !== hash))
      throw new BaseError(
        'The transaction changed after a frame was signed. Prepare and sign it again.',
      )
  }

  return result
}

function getHash(transaction: Transaction) {
  if (
    transaction.chainId === undefined ||
    transaction.nonce === undefined ||
    transaction.maxFeePerGas === undefined ||
    transaction.maxPriorityFeePerGas === undefined ||
    transaction.frames.some(
      (frame) =>
        frame.executionGas === undefined || frame.stateGas === undefined,
    )
  )
    throw new BaseError('Prepare the transaction before signing a frame.')

  return TxEnvelopeEip8141.getSignPayload({
    ...transaction,
    nonce: BigInt(transaction.nonce),
  })
}

export async function signFrame(
  frame: Frame,
  transaction: Transaction,
  { payloadsOnly = false }: { payloadsOnly?: boolean | undefined } = {},
): Promise<Frame> {
  const state = (frame as SigningFrame)[signing]
  const frameIndex = transaction.frames.indexOf(frame)
  if (!state || frameIndex === -1)
    throw new BaseError(
      'Expected a signing frame from the prepared transaction.',
    )

  let resolved = resolve(transaction)
  getHash(resolved)
  if (state.hash) return frame

  const prepared = (resolved.frames[frameIndex] as SigningFrame)[signing]!
    .prepared!
  const entries = structuredClone(prepared.signatures.map(toSignature))
  const signedSignatures = [...(state.signedSignatures ?? entries)]

  // Explicit payload witnesses are committed by the canonical transaction hash.
  if (!state.signedSignatures)
    for (const [index, entry] of prepared.signatures.entries()) {
      if (!entry.payload || entry.payload === '0x') continue
      const signature = await entry.sign({
        hash: entry.payload,
        signatureIndex: prepared.signatureIndex + index,
        transaction: resolved,
      })
      if (signature === undefined || signature === null)
        throw new BaseError('Signature signing must return a signature value.')
      signedSignatures[index] = FrameSignature_ox.from({
        ...entries[index]!,
        signature,
      } as FrameSignature)
    }

  const partial: SigningFrame = {
    ...resolved.frames[frameIndex],
    [signing]: { ...state, prepared, signedSignatures },
  }
  resolved = resolve({
    ...resolved,
    frames: resolved.frames.map((frame, index) =>
      index === frameIndex ? partial : frame,
    ),
  })
  if (payloadsOnly) return partial

  const canonical = prepared.signatures.some(
    (entry) => !entry.payload || entry.payload === '0x',
  )
  if (
    canonical &&
    resolved.frames.some((frame) => {
      const state = (frame as SigningFrame)[signing]
      return (
        !state?.signedSignatures &&
        state?.prepared?.signatures.some(
          (entry) => entry.payload && entry.payload !== '0x',
        )
      )
    })
  )
    throw new BaseError(
      'Sign explicit-payload frames before transaction-hash frames.',
    )

  const hash = getHash(resolved)
  for (const [index, entry] of prepared.signatures.entries()) {
    if (entry.payload && entry.payload !== '0x') continue
    const signature = await entry.sign({
      hash,
      signatureIndex: prepared.signatureIndex + index,
      transaction: resolved,
    })
    if (signature === undefined || signature === null)
      throw new BaseError('Signature signing must return a signature value.')
    signedSignatures[index] = FrameSignature_ox.from({
      ...entries[index]!,
      signature,
    } as FrameSignature)
  }

  return {
    ...partial,
    [signing]: {
      ...state,
      prepared,
      ...(canonical ? { hash } : {}),
      signedSignatures,
    },
  } as SigningFrame
}

function toSignature({ sign: _sign, ...entry }: Signature): FrameSignature {
  return {
    ...(entry.scheme === 'arbitrary' ? { signature: '0x' as const } : {}),
    ...entry,
  } as FrameSignature
}
