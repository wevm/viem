import type { Address } from 'abitype'
import * as FrameSignature_ox from 'ox/FrameSignature'
import * as Hex_ox from 'ox/Hex'
import * as TxEnvelopeEip8141 from 'ox/TxEnvelopeEip8141'
import type { Account } from '../../accounts/types.js'
import { BaseError } from '../../errors/base.js'
import type { Frame, FrameSignature } from '../../types/frame.js'
import type { Hex } from '../../types/misc.js'
import type { TransactionSerializableEIP8141 } from '../../types/transaction.js'
import { concat } from '../../utils/data/concat.js'
import type * as Frames from '../Frame.js'

export const expiryVerifier = '0x0000000000000000000000000000000000008141'

export type Prepared<transaction> = transaction & {
  frameContext?: Frames.Context | undefined
}

export type Transaction = Prepared<
  TransactionSerializableEIP8141<bigint, number, Frame>
>

export function hasSigningFrames(transaction: {
  frames?: readonly Frames.Input[] | undefined
  frameContext?: Frames.Context | undefined
}): boolean {
  return !!(
    transaction.frames?.some(
      (frame) => typeof frame === 'function' || 'frame' in frame,
    ) ||
    transaction.frameContext?.entries.some((entry) => entry.signatures.length)
  )
}

export function applyDataSuffix<
  transaction extends {
    frames?: readonly Frames.Input[] | undefined
    signatures?: readonly FrameSignature[] | undefined
    frameContext?: Frames.Context | undefined
  },
>(transaction: transaction, suffix: Hex | undefined): transaction {
  if (!suffix || !transaction.frames) return transaction
  if (
    transaction.frameContext?.entries.some((entry) => entry.hash) ||
    transaction.signatures?.some(
      (entry) =>
        (!entry.payload || entry.payload === '0x') &&
        entry.signature &&
        entry.signature !== '0x',
    )
  )
    return transaction

  const context = transaction.frameContext ?? { entries: [] }
  const suffixes = new Set(context.suffixes)
  const frames = transaction.frames.map((frame, index) => {
    if (typeof frame === 'function' || 'frame' in frame || suffixes.has(index))
      return frame

    const entry = context.entries.find((entry) => entry.frameIndex === index)
    if (!entry?.dataSuffix && frame.mode !== 'sender' && frame.mode !== 2)
      return frame

    const value = entry?.dataSuffix
      ? entry.dataSuffix({ frame, index: entry.dataSuffixIndex ?? 0, suffix })
      : suffix

    suffixes.add(index)
    if (value === undefined || value === '0x') return frame
    return { ...frame, data: concat([frame.data ?? '0x', value]) }
  })
  return {
    ...transaction,
    frames,
    frameContext: { ...context, suffixes: [...suffixes] },
  }
}

type Request = {
  nonceKeys?: readonly (bigint | 'random')[] | undefined
  frames?: readonly Frames.Input[] | undefined
  signatures?: Transaction['signatures'] | undefined
  frameContext?: Frames.Context | undefined
  account?: Account | Address | null | undefined
}

export type Resolved<transaction> = (transaction extends unknown
  ? 'frames' extends keyof transaction
    ? [Exclude<transaction['frames'], undefined>] extends [never]
      ? transaction
      : Omit<transaction, 'frames'> &
          (transaction extends { frames: readonly Frames.Input[] }
            ? { frames: readonly Frame[] }
            : { frames?: readonly Frame[] | undefined }) & {
            frameContext?: Frames.Context | undefined
            signatures?: Transaction['signatures'] | undefined
          }
    : transaction
  : never) & {
  frames?: readonly Frame[] | undefined
  frameContext?: Frames.Context | undefined
}

export function resolve<transaction extends Request>(
  transaction: transaction,
  options?: { account?: Account | Address | null | undefined },
): Resolved<transaction>
export function resolve(
  transaction: Request,
  options: { account?: Account | Address | null | undefined } = {},
): unknown {
  const { account = transaction.account } = options

  if (
    transaction.frames &&
    (transaction.nonceKeys === undefined ||
      transaction.nonceKeys.includes('random'))
  )
    transaction = {
      ...transaction,
      nonceKeys: resolveNonceKeys(transaction.nonceKeys),
    }

  if (!transaction.frames) return transaction
  const inputs = transaction.frames
  if (
    !inputs.some((frame) => typeof frame === 'function' || 'frame' in frame) &&
    !transaction.frameContext
  )
    return transaction

  const previous = transaction.frameContext?.entries ?? []
  if (
    !inputs.some((frame) => typeof frame === 'function' || 'frame' in frame) &&
    previous.every(
      (entry) =>
        !entry.signatures.length &&
        !entry.afterFill &&
        inputs[entry.frameIndex] === entry.frame,
    )
  )
    return transaction

  const declarations: Frames.Entry[] = inputs.map((frame, frameIndex) => ({
    ...previous.find((entry) => entry.frameIndex === frameIndex),
    frame:
      typeof frame === 'function' ? {} : 'frame' in frame ? frame.frame : frame,
    prepare: typeof frame === 'function' ? frame : undefined,
    frameIndex,
    signatureIndex: 0,
    signatures: [],
  }))
  const entries: Frames.Entry[] = []
  const fresh = new Set<Frames.Entry>()
  const expansions = new Map<Frames.Entry, number>()
  const witnesses = new Map<number, FrameSignature>()
  let signatureIndex = 0

  for (const [index, input] of inputs.entries()) {
    if ('frame' in input) {
      const signed = input as Frames.Signed
      const cached = previous.find((entry) => entry.frameIndex === index)
      if (
        !cached ||
        cached.frameIndex !== entries.length ||
        cached.signatureIndex !== signed.signatureIndex ||
        cached.signatures.length !== signed.signatures.length
      )
        throw new BaseError(
          'Frame.sign: signed frame index, signature index, or signature count differs from its prepared allocation.',
        )

      entries.push({
        ...cached,
        frame: signed.frame,
        hash: signed.hash ?? cached.hash,
      })
      for (const [offset, signature] of signed.signatures.entries())
        witnesses.set(signed.signatureIndex + offset, signature)
      signatureIndex += signed.signatures.length
      continue
    }
    const prepare = typeof input === 'function' ? input : undefined
    const plain = typeof input === 'function' ? {} : input
    const cached = previous.find((entry) => entry.frameIndex === index)
    if (!prepare && cached) {
      const entry = { ...cached, frame: plain, frameIndex: entries.length }
      entries.push(entry)
      signatureIndex += entry.signatures.length
      continue
    }
    if (!prepare) {
      entries.push({
        frame: plain,
        frameIndex: entries.length,
        signatureIndex,
        signatures: [],
      })
      continue
    }

    const result = prepare({ account, entries: declarations, signatureIndex })
    if (result.frames) {
      if (
        result.frames.some(
          (frame) => typeof frame === 'function' || 'frame' in frame,
        )
      )
        throw new BaseError(
          'Frame.from: `frames` must contain protocol frame objects, without callbacks or signed frame envelopes.',
        )
      if (result.signatures?.length && !result.frames.length)
        throw new BaseError(
          'Frame.from: a nonempty `signatures` array requires at least one protocol frame.',
        )
      const signatures = (result.signatures ?? []).map((signature) => ({
        ...signature,
      }))
      if (signatures.some((entry) => typeof entry.sign !== 'function'))
        throw new BaseError(
          'Frame.from: each `signatures` entry must define a `sign` function.',
        )
      for (const [i, frame] of result.frames.entries()) {
        const entry: Frames.Entry = {
          frame,
          frameIndex: entries.length,
          signatureIndex,
          signatures: i === 0 ? signatures : [],
          name: result.name,
          dataSuffix: result.dataSuffix,
          dataSuffixIndex: i,
          afterFill: i === 0 ? result.afterFill : undefined,
          prepare: i === 0 && signatures.length ? prepare : undefined,
          ...(i === 0 && signatures.length
            ? { frameCount: result.frames.length }
            : {}),
        }
        entries.push(entry)
        if (entry.prepare) {
          fresh.add(entry)
          expansions.set(entry, result.frames.length)
        }
        if (i === 0) signatureIndex += signatures.length
      }
      continue
    }
    const signatures = (result.signatures ?? []).map((signature) => ({
      ...signature,
    }))
    if (signatures.some((entry) => typeof entry.sign !== 'function'))
      throw new BaseError(
        'Frame.from: each `signatures` entry must define a `sign` function.',
      )
    const entry: Frames.Entry = {
      ...result,
      frame: result.frame,
      frameIndex: entries.length,
      signatureIndex,
      signatures,
      prepare,
      dataSuffix: result.dataSuffix,
    }
    entries.push(entry)
    fresh.add(entry)
    signatureIndex += signatures.length
  }

  // Every helper can now inspect peer names and allocated signature slots.
  for (const entry of entries) {
    if (!fresh.has(entry) || !entry.prepare) continue
    const result = entry.prepare({
      account,
      entries,
      signatureIndex: entry.signatureIndex,
    })
    if (Boolean(result.frames) !== expansions.has(entry))
      throw new BaseError(
        'Frame.from: preparation passes must preserve the return shape and expanded frame count.',
      )
    if (result.frames) {
      if (
        result.frames.some(
          (frame) => typeof frame === 'function' || 'frame' in frame,
        )
      )
        throw new BaseError(
          'Frame.from: `frames` must contain protocol frame objects, without callbacks or signed frame envelopes.',
        )
      if (result.frames.length !== expansions.get(entry))
        throw new BaseError(
          'Frame.from: preparation passes must preserve the return shape and expanded frame count.',
        )
      for (const [offset, frame] of result.frames.entries())
        entries[entry.frameIndex + offset] = {
          ...entries[entry.frameIndex + offset]!,
          frame,
          dataSuffix: result.dataSuffix,
          dataSuffixIndex: offset,
        }
    } else if (!result.frame)
      throw new BaseError(
        'Frame.from: preparation passes must preserve the return shape and expanded frame count.',
      )
    if (result.signatures?.some((entry) => typeof entry.sign !== 'function'))
      throw new BaseError(
        'Frame.from: each `signatures` entry must define a `sign` function.',
      )
    if (
      JSON.stringify(
        (result.signatures ?? []).map((entry) =>
          FrameSignature_ox.toRpc(toSignature(entry)),
        ),
      ) !==
      JSON.stringify(
        entry.signatures.map((entry) =>
          FrameSignature_ox.toRpc(toSignature(entry)),
        ),
      )
    )
      throw new BaseError(
        'Frame.from: preparation passes must preserve signature count, scheme, signer, and payload.',
      )
    const index = entry.frameIndex
    entries[index] = {
      ...entry,
      ...result,
      frame: result.frames?.[0] ?? result.frame!,
      frameIndex: index,
      signatures: (result.signatures ?? []).map((signature) => ({
        ...signature,
      })),
      dataSuffix: result.dataSuffix,
    }
  }

  const frames = entries.map((entry) => entry.frame)
  if (
    frames.some(
      (frame, index) =>
        index > 0 &&
        (frame.mode === 'verify' || frame.mode === 1) &&
        frame.to?.toLowerCase() === expiryVerifier,
    )
  )
    throw new BaseError(
      'Frame.expiry: the expiry verifier must occupy frame index 0 and occur exactly once.',
    )

  const expectedSignatures = entries.flatMap((entry) =>
    entry.signatures.map(toSignature),
  )
  if (
    expectedSignatures.length &&
    transaction.signatures?.some((entry, index) => {
      const expectedEntry = expectedSignatures[index]
      if (!expectedEntry) return true
      const actual = FrameSignature_ox.toRpc(entry)
      const expected = FrameSignature_ox.toRpc(expectedEntry)
      return (
        actual.scheme !== expected.scheme ||
        actual.signer?.toLowerCase() !== expected.signer?.toLowerCase() ||
        actual.msg !== expected.msg ||
        (!previous.length &&
          actual.signature !== undefined &&
          actual.signature !== '0x')
      )
    })
  )
    throw new BaseError(
      'Frame.from: transaction `signatures` conflict with the declared frame signature allocations. Supply signatures through frame signing callbacks.',
    )

  const signatures = expectedSignatures.map((entry, index) => {
    const signature =
      witnesses.get(index) ?? transaction.signatures?.[index] ?? entry
    const actual = FrameSignature_ox.toRpc(signature)
    const expected = FrameSignature_ox.toRpc(entry)
    if (
      actual.scheme !== expected.scheme ||
      actual.signer?.toLowerCase() !== expected.signer?.toLowerCase() ||
      actual.msg !== expected.msg
    )
      throw new BaseError(
        'Frame.sign: signed signature scheme, signer, or payload differs from its prepared allocation.',
      )
    return signature
  })

  const result = {
    ...transaction,
    frames,
    ...(signatures.length ? { signatures } : {}),
    frameContext: { ...transaction.frameContext, entries },
  }
  if (entries.some((entry) => entry.hash)) {
    const hash = getHash(result as unknown as Transaction)
    if (entries.some((entry) => entry.hash && entry.hash !== hash))
      throw new BaseError(
        'Frame.sign: transaction hash differs from the signed frame hash. Prepare and sign the modified transaction again.',
      )
  }
  return result
}

export function getHash(transaction: Transaction) {
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
    throw new BaseError(
      'Frame.sign: transaction hashing requires `chainId`, `nonce`, fee parameters, and execution/state gas budgets for every frame. Call `prepareTransactionRequest` first.',
    )

  return TxEnvelopeEip8141.getSignPayload({
    ...transaction,
    nonceKeys: transaction.nonceKeys ?? [0n],
    nonce: BigInt(transaction.nonce),
  })
}

function toSignature(signature: Frames.Signature): FrameSignature {
  const { sign: _sign, placeholder: _placeholder, ...entry } = signature

  return {
    ...(entry.scheme === 'arbitrary' || entry.scheme === 0
      ? { signature: '0x' as const }
      : {}),
    ...entry,
  } as FrameSignature
}

/** Adds unsigned helper witnesses for simulation without changing the prepared transaction. */

export function getSimulationSignatures(transaction: {
  frameContext?: Frames.Context | undefined
  signatures?: readonly FrameSignature[] | undefined
}): readonly FrameSignature[] | undefined {
  const { frameContext, signatures } = transaction

  let result: FrameSignature[] | undefined
  for (const state of frameContext?.entries ?? []) {
    if (state.hash) continue
    for (const [index, entry] of state.signatures.entries()) {
      if (entry.placeholder === undefined) continue
      if (entry.scheme !== 'arbitrary' && entry.scheme !== 0)
        throw new BaseError(
          'Frame.from: `placeholder` is supported only for signatures with `scheme: "arbitrary"`.',
        )
      const slot = state.signatureIndex + index
      const signature = signatures?.[slot]
      if (!signature || (signature.signature && signature.signature !== '0x'))
        continue
      result ??= [...signatures!]
      result[slot] = {
        scheme: entry.scheme,
        payload: signature.payload,
        signature: entry.placeholder,
      }
    }
  }
  return result ?? signatures
}

export function resolveNonceKeys(
  keys: readonly (bigint | 'random')[] = [0n],
): readonly bigint[] {
  if (keys.every((key) => typeof key === 'bigint')) return keys

  const used = new Set(
    keys.filter((key): key is bigint => typeof key === 'bigint'),
  )
  const resolved = keys.map((key) => {
    if (key !== 'random') return key

    let value: bigint
    do value = Hex_ox.toBigInt(Hex_ox.random(32))
    while (value === 0n || used.has(value))
    used.add(value)
    return value
  })
  return resolved.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}
