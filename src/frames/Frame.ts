import type { Address } from 'abitype'
import * as FrameSignature_ox from 'ox/FrameSignature'
import type * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import type { Account } from '../accounts/types.js'
import type { Client } from '../clients/createClient.js'
import { BaseError, type BaseErrorType } from '../errors/base.js'
import type { ErrorType as ErrorType_ } from '../errors/utils.js'
import type { Frame as Frame_, FrameSignature } from '../types/frame.js'
import type { Hex } from '../types/misc.js'
import type { TransactionSerializableEIP8141 } from '../types/transaction.js'
import type { UnionOmit } from '../types/utils.js'
import * as internal from './internal/transaction.js'

// biome-ignore lint/performance/noBarrelFile: public frame namespace
export { calls } from './calls.js'
export { expiry } from './expiry.js'
export { fee } from './fee.js'
export { verify } from './verify.js'

/** A protocol frame, preparation callback, or completed signed frame. */
export type Input<quantity = bigint> =
  | Frame_<quantity>
  | (quantity extends bigint ? Frame | Signed : never)

type Transaction = internal.Transaction

/** A signature entry paired with its signing callback. */
export type Signature = (
  | (UnionOmit<
      Extract<FrameSignature, { scheme: 0 | 'arbitrary' }>,
      'signature'
    > & {
      /** Witness bytes used only by simulation RPCs. The verifier must support this placeholder. */
      placeholder?: Hex | undefined
    })
  | (UnionOmit<
      Exclude<FrameSignature, { scheme: 0 | 'arbitrary' }>,
      'signature'
    > & {
      placeholder?: never
    })
) & {
  /** Signs this entry after transaction preparation is complete. */
  sign: (parameters: {
    hash: Hex
    /** This entry's allocated transaction signature index. */
    signatureIndex: number
    transaction: Transaction
  }) => Promise<NonNullable<FrameSignature['signature']>>
}

/** Prepares a frame after its peers have declared their names and signature slots. */
export type Frame = (parameters: {
  account?: Account | Address | null | undefined
  entries: readonly Entry[]
  signatureIndex: number
}) => {
  name?: string | undefined
  afterFill?: AfterFill | undefined
  /** Returns the suffix to append before gas filling; undefined leaves calldata unchanged. */
  dataSuffix?: DataSuffix | undefined
} & (
  | {
      frame: Frame_
      frames?: never
      signatures?: readonly Signature[] | undefined
    }
  | {
      frames: readonly Frame_[]
      frame?: never
      /** Signature entries belong to the first expanded frame. */
      signatures?: readonly Signature[] | undefined
    }
)

/** Returns a suffix to append to each frame before gas filling; undefined skips appending. */
export type DataSuffix = (context: {
  frame: Frame_
  /** Index within this helper's returned frames. */
  index: number
  suffix: Hex
}) => Hex | undefined

/** Hook that updates frame calldata after gas and fees have been filled. */
export type AfterFill = (context: {
  client: Client
  transaction: Transaction
  entries: readonly Entry[]
  frameIndex: number
}) => Promise<
  | {
      frames: readonly ({ index: number } & Partial<Frame_>)[]
      /** Validate filled budgets before accepting these updates. */
      validate?: ((transaction: Transaction) => boolean) | undefined
    }
  | undefined
>

/** A named frame and its request-scoped preparation state. */
export type Entry = {
  name?: string | undefined
  frame: Frame_
  frameIndex: number
  /** Number of protocol frames produced by this signing definition. */
  frameCount?: number | undefined
  signatureIndex: number
  signatures: readonly Signature[]
  prepare?: Frame | undefined
  afterFill?: AfterFill | undefined
  hash?: Hex | undefined
  dataSuffix?: DataSuffix | undefined
  dataSuffixIndex?: number | undefined
}

/** Completed witnesses for one frame at its allocated transaction position. */
export type Signed = {
  frame: Frame_
  signatures: readonly FrameSignature[]
  signatureIndex: number
  hash?: Hex | undefined
}

/** Local preparation and signing state, excluded from transaction serialization. */
export type Context = {
  entries: readonly Entry[]
  suffixes?: readonly number[] | undefined
  afterFillHash?: Hex | undefined
}

/**
 * Defines a frame or expands into multiple frames with signatures on the first.
 * Preparation may invoke this callback more than once; keep it free of side effects.
 * - Docs: https://viem.sh/docs/frames/from
 * @example
 * ```ts
 * import { Frame } from 'viem/frames'
 *
 * const frame = Frame.from((context) => ({
 *   frame: { mode: 'verify', to: verifier, data: encodeValidation(context.signatureIndex) },
 *   signatures: [{
 *     scheme: 'secp256k1',
 *     signer: account.address,
 *     async sign(parameters) {
 *       return account.sign({ hash: parameters.hash })
 *     },
 *   }],
 * }))
 * ```
 * @param definition - Returns `frame` with signature entries, or `frames` to expand.
 * @returns A callback that transaction actions prepare before signing.
 */
export function from(definition: Frame) {
  return definition
}

/**
 * Signs a frame against its prepared transaction without mutating either.
 * - Docs: https://viem.sh/docs/frames/sign
 * @param frame - The resolved frame object from the prepared transaction.
 * @param options - The complete transaction containing the frame.
 * @returns A signed frame to replace the original at the same position.
 */
export async function sign(
  frame: Frame_ | Signed,
  options: sign.Options,
): Promise<Signed> {
  const { transaction, payloadsOnly = false } = options

  const frameIndex = transaction.frames.indexOf(frame)
  const resolved = internal.resolve(transaction)
  const entry = resolved.frameContext?.entries.find(
    (entry) => entry.frameIndex === frameIndex,
  )
  if (frameIndex === -1 || !entry?.prepare)
    throw new BaseError(
      'Frame.sign: `frame` must reference a prepared transaction frame with allocated signing callbacks.',
    )
  internal.getHash(resolved)
  if (
    entry.hash &&
    entry.signatures.every((_, index) => {
      const signature =
        resolved.signatures?.[entry.signatureIndex + index]?.signature
      return signature && signature !== '0x'
    })
  ) {
    if ('frame' in frame) return frame as Signed
    return {
      frame: entry.frame,
      signatures: resolved.signatures!.slice(
        entry.signatureIndex,
        entry.signatureIndex + entry.signatures.length,
      ),
      signatureIndex: entry.signatureIndex,
      hash: entry.hash,
    }
  }

  const signatures = structuredClone([...(resolved.signatures ?? [])])
  const declarations = entry.signatures.map((signature) => ({ ...signature }))
  const request = {
    ...resolved,
    signatures,
    frameContext: {
      ...resolved.frameContext!,
      entries: resolved.frameContext!.entries.map((candidate) =>
        candidate === entry
          ? { ...entry, signatures: declarations }
          : candidate,
      ),
    },
  }

  for (const [index, signature] of declarations.entries()) {
    if (!signature.payload || signature.payload === '0x') continue
    const slot = entry.signatureIndex + index
    if (signatures[slot]?.signature && signatures[slot]!.signature !== '0x')
      continue
    const witness = await signature.sign({
      hash: signature.payload,
      signatureIndex: slot,
      transaction: request,
    })
    if (witness === undefined || witness === null)
      throw new BaseError(
        'Frame.sign: a signature callback returned no signature value.',
      )
    signatures[slot] = FrameSignature_ox.from({
      ...signatures[slot]!,
      signature: witness,
    } as FrameSignature)
  }
  if (payloadsOnly)
    return {
      frame: entry.frame,
      signatures: signatures.slice(
        entry.signatureIndex,
        entry.signatureIndex + declarations.length,
      ),
      signatureIndex: entry.signatureIndex,
    }

  const canonical = declarations.some(
    (entry) => !entry.payload || entry.payload === '0x',
  )
  if (
    canonical &&
    signatures.some(
      (entry) =>
        entry.payload &&
        entry.payload !== '0x' &&
        (!entry.signature || entry.signature === '0x'),
    )
  )
    throw new BaseError(
      'Frame.sign: explicit-payload signatures must be populated before canonical transaction-hash signatures.',
    )

  const hash = internal.getHash(request)
  for (const [index, signature] of declarations.entries()) {
    if (signature.payload && signature.payload !== '0x') continue
    const slot = entry.signatureIndex + index
    if (signatures[slot]?.signature && signatures[slot]!.signature !== '0x')
      continue
    const witness = await signature.sign({
      hash,
      signatureIndex: slot,
      transaction: request,
    })
    if (witness === undefined || witness === null)
      throw new BaseError(
        'Frame.sign: a signature callback returned no signature value.',
      )
    signatures[slot] = FrameSignature_ox.from({
      ...signatures[slot]!,
      signature: witness,
    } as FrameSignature)
  }

  return {
    frame: entry.frame,
    signatures: signatures.slice(
      entry.signatureIndex,
      entry.signatureIndex + declarations.length,
    ),
    signatureIndex: entry.signatureIndex,
    ...(canonical ? { hash } : {}),
  }
}

export declare namespace sign {
  type Options = {
    /** The complete prepared transaction containing the selected frame. */
    transaction: TransactionSerializableEIP8141
    /** @internal Finalizes explicit payloads before canonical transaction signing. */
    payloadsOnly?: boolean | undefined
  }

  /** Errors from preparation validation, signature conversion, or the signing callback. */
  type ErrorType =
    | BaseErrorType
    | FrameSignature_ox.from.ErrorType
    | TxEnvelopeEip8141.getSignPayload.ErrorType
    | ErrorType_
}
