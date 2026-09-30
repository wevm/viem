import * as FrameSignature_ox from 'ox/FrameSignature'
import * as Hex_ox from 'ox/Hex'
import * as Rlp from 'ox/Rlp'
import type { FrameSignature } from '../../types/frame.js'
import type { Hex } from '../../types/misc.js'
import type * as FrameTransaction from './transaction.js'

export const maxSignatureSize = 4096
export const abi = [
  {
    type: 'function',
    name: 'quoteAndAuthentication',
    stateMutability: 'view',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'address' },
      { type: 'address' },
    ],
  },
  {
    type: 'function',
    name: 'pay',
    stateMutability: 'nonpayable',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [],
  },
] as const

export function signatureSize(signature: FrameSignature): bigint {
  if (signature.scheme === 'arbitrary' || signature.scheme === 0)
    return BigInt(maxSignatureSize)
  return signature.scheme === 'p256' || signature.scheme === 2 ? 128n : 65n
}

/** Derives the total frame gas limit, including intrinsic costs and the calldata floor. */
export function getGas(transaction: FrameTransaction.Transaction): bigint {
  let intrinsic = 12_000n + BigInt(transaction.frames.length) * 475n
  let execution = 0n
  let state = 0n
  const data: Hex[] = []
  if (transaction.nonceKeys !== undefined) {
    const quantity = (value: bigint) =>
      value === 0n ? '0x' : Hex_ox.fromNumber(value)
    data.push(
      Rlp.fromHex(transaction.nonceKeys.map(quantity)),
      Rlp.fromHex(quantity(BigInt(transaction.nonce ?? 0))),
    )
  }

  for (const frame of transaction.frames) {
    execution += frame.executionGas ?? 0n
    state += frame.stateGas ?? 0n
    data.push(frame.data ?? '0x')
    if (
      (frame.value ?? 0n) > 0n &&
      frame.to &&
      frame.to.toLowerCase() !== transaction.sender.toLowerCase()
    )
      intrinsic += 6_000n
  }
  for (const entry of transaction.signatures ?? []) {
    const [scheme, signer, message, signature] =
      FrameSignature_ox.toTuple(entry)
    intrinsic += (() => {
      if (scheme === '0x') return 100n
      if (scheme === '0x01') return 2_800n
      return 6_700n
    })()
    data.push(signer, message, signature)
  }

  let tokens = 0n
  let size = 0n
  for (const value of data) {
    size += BigInt(Hex_ox.size(value))
    for (const byte of Hex_ox.toBytes(value)) tokens += byte === 0 ? 1n : 4n
  }
  const standard = execution + tokens * 4n
  const floor = size * 64n
  return intrinsic + state + (standard > floor ? standard : floor)
}
