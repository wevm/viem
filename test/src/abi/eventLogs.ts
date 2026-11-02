/* c8 ignore start */

import type { AbiEvent, AbiParameter } from 'abitype'
import fc from 'fast-check'
import type { Log } from '../../../src/types/log.js'
import type { Hex } from '../../../src/types/misc.js'
import { encodeAbiParameters } from '../../../src/utils/abi/encodeAbiParameters.js'
import { getAddress } from '../../../src/utils/address/getAddress.js'
import { stringToHex, toHex } from '../../../src/utils/encoding/toHex.js'
import { keccak256 } from '../../../src/utils/hash/keccak256.js'
import { toEventSelector } from '../../../src/utils/hash/toEventSelector.js'

/** An ABI parameter type, and a generator for its decoded values. */
export type Kind = {
  arbitrary: fc.Arbitrary<unknown>
  components?: readonly (AbiParameter & { kind: Kind })[] | undefined
  type: string
}

const hex = (minLength: number, maxLength = minLength) =>
  fc.uint8Array({ minLength, maxLength }).map((x) => toHex(x))

function uint(bits: number): Kind {
  const max = 2n ** BigInt(bits) - 1n
  // Viem decodes integers of 48 bits or fewer as numbers.
  const arbitrary =
    bits <= 48
      ? fc.integer({ min: 0, max: Number(max) })
      : fc.bigInt({ min: 0n, max })
  return { arbitrary, type: `uint${bits}` }
}

function int(bits: number): Kind {
  const max = 2n ** BigInt(bits - 1) - 1n
  const arbitrary =
    bits <= 48
      ? fc.integer({ min: -Number(max) - 1, max: Number(max) })
      : fc.bigInt({ min: -max - 1n, max })
  return { arbitrary, type: `int${bits}` }
}

const primitives: readonly Kind[] = [
  { arbitrary: hex(20).map((x) => getAddress(x)), type: 'address' },
  { arbitrary: fc.boolean(), type: 'bool' },
  { arbitrary: hex(0, 48), type: 'bytes' },
  { arbitrary: fc.string({ maxLength: 40 }), type: 'string' },
  ...[1, 4, 20, 32].map((size) => ({
    arbitrary: hex(size),
    type: `bytes${size}`,
  })),
  ...[8, 16, 32, 48, 56, 64, 128, 256].flatMap((bits) => [
    uint(bits),
    int(bits),
  ]),
]

const primitive = fc.constantFrom(...primitives)

function array(kind: Kind, length: number | undefined): Kind {
  const arbitrary =
    length === undefined
      ? fc.array(kind.arbitrary, { maxLength: 3 })
      : fc.array(kind.arbitrary, { maxLength: length, minLength: length })
  return {
    ...kind,
    arbitrary,
    type: `${kind.type}[${length ?? ''}]`,
  }
}

function tuple(kinds: readonly Kind[]): Kind {
  const components = kinds.map((kind, i) => ({
    ...(kind.components ? { components: kind.components } : {}),
    kind,
    name: `c${i}`,
    type: kind.type,
  }))
  return {
    arbitrary: fc.record(
      Object.fromEntries(components.map((c) => [c.name, c.kind.arbitrary])),
    ),
    components,
    type: 'tuple',
  }
}

const kind: fc.Arbitrary<Kind> = fc.oneof(
  { arbitrary: primitive, weight: 6 },
  {
    arbitrary: fc
      .tuple(primitive, fc.option(fc.integer({ min: 1, max: 2 })))
      .map(([kind, length]) => array(kind, length ?? undefined)),
    weight: 1,
  },
  {
    arbitrary: fc
      .array(primitive, { maxLength: 3, minLength: 1 })
      .map((kinds) => tuple(kinds)),
    weight: 1,
  },
)

function toParameter(kind: Kind): AbiParameter {
  return {
    ...(kind.components
      ? {
          components: kind.components.map((c) => ({
            ...toParameter(c.kind),
            name: c.name,
          })),
        }
      : {}),
    type: kind.type,
  } as AbiParameter
}

export type Input = {
  indexed: boolean
  kind: Kind
  name: string
}

export type Case = {
  args: readonly unknown[]
  event: AbiEvent
  inputs: readonly Input[]
}

/**
 * An event with up to five inputs of any type, and a value for each input.
 * Names come from a small set, so ABIs hold overloads.
 */
export const eventCase: fc.Arbitrary<Case> = fc
  .record({
    anonymous: fc.boolean(),
    inputs: fc.array(
      fc.record({ indexed: fc.boolean(), kind, named: fc.boolean() }),
      { maxLength: 5 },
    ),
    name: fc.constantFrom('Transfer', 'Approval', 'Foo', 'Bar'),
    // Events with only some inputs named decode to an array, like unnamed ones.
    naming: fc.constantFrom('all', 'none', 'some'),
  })
  .chain((value) => {
    // A log has at most four topics, and a non-anonymous event spends one
    // on its signature.
    const maxIndexed = value.anonymous ? 4 : 3
    let count = 0
    const inputs = value.inputs.map((input, i) => {
      const indexed = input.indexed && count < maxIndexed
      if (indexed) count++
      const named =
        value.naming === 'all' || (value.naming === 'some' && input.named)
      return { indexed, kind: input.kind, name: named ? `a${i}` : '' }
    })
    const event = {
      anonymous: value.anonymous,
      inputs: inputs.map((input) => ({
        ...toParameter(input.kind),
        indexed: input.indexed,
        name: input.name,
      })),
      name: value.name,
      type: 'event',
    } as AbiEvent
    return fc
      .tuple(...inputs.map((input) => input.kind.arbitrary))
      .map((args): Case => ({ args, event, inputs }))
  })

/** Whether a topic holds the keccak256 of the value rather than the value. */
export function isHashed(kind: Kind) {
  return (
    kind.type === 'string' ||
    kind.type === 'bytes' ||
    kind.type === 'tuple' ||
    kind.type.endsWith(']')
  )
}

function topicOf(input: Input, value: unknown): Hex {
  if (input.kind.type === 'string')
    return keccak256(stringToHex(value as string))
  if (input.kind.type === 'bytes') return keccak256(value as Hex)
  const encoded = encodeAbiParameters([toParameter(input.kind)], [value])
  if (isHashed(input.kind)) return keccak256(encoded)
  return encoded
}

/** Encodes a log for an event the same way a contract emits it. */
export function encodeLog(value: Case) {
  const { args, event, inputs } = value
  const topics: Hex[] = event.anonymous ? [] : [toEventSelector(event as never)]
  const nonIndexed: Input[] = []
  const data: unknown[] = []
  for (const [i, input] of inputs.entries()) {
    if (input.indexed) topics.push(topicOf(input, args[i]))
    else {
      nonIndexed.push(input)
      data.push(args[i])
    }
  }
  return {
    data:
      nonIndexed.length > 0
        ? encodeAbiParameters(
            nonIndexed.map((input) => toParameter(input.kind)),
            data,
          )
        : ('0x' as Hex),
    topics,
  }
}

/** The arguments a decoder returns for a log of `value`. */
export function expectedArgs(value: Case) {
  const { args, inputs } = value
  if (inputs.length === 0) return undefined
  const decoded = inputs.map((input, i) => {
    const arg = args[i]
    if (input.indexed && isHashed(input.kind)) return topicOf(input, arg)
    return arg
  })
  // Viem returns an array when any input is unnamed, in input order.
  if (inputs.some((input) => !input.name)) return decoded
  return Object.fromEntries(inputs.map((input, i) => [input.name, decoded[i]]))
}

export function toLog(value: { data: Hex; topics: readonly Hex[] }) {
  return {
    address: '0x00000000000000000000000000000000000000aa',
    blockHash:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    blockNumber: 1n,
    data: value.data,
    logIndex: 0,
    removed: false,
    topics: value.topics,
    transactionHash:
      '0x0000000000000000000000000000000000000000000000000000000000000002',
    transactionIndex: 0,
  } as unknown as Log
}

/** A log that no ABI emitted: up to four random topics and random data. */
export const noiseLog = fc
  .record({
    data: hex(0, 160),
    topics: fc.array(hex(32), { maxLength: 4 }),
  })
  .map((value) => ({ data: value.data, topics: value.topics as Hex[] }))

/** A random ABI, and a batch of logs that its events emit, mixed with noise. */
export const abiCase = fc
  .array(eventCase, { maxLength: 4, minLength: 1 })
  .chain((cases) =>
    fc
      .array(
        fc.oneof(
          fc.constantFrom(...cases).map((value) => encodeLog(value)),
          noiseLog,
        ),
        { maxLength: 6 },
      )
      .map((logs) => ({ abi: cases.map((x) => x.event), cases, logs })),
  )

/** Lowercases every hex string in a value, at any depth. */
export function lowercase(value: unknown): unknown {
  if (typeof value === 'string' && value.startsWith('0x'))
    return value.toLowerCase()
  if (Array.isArray(value)) return value.map((x) => lowercase(x))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, x]) => [key, lowercase(x)]),
    )
  return value
}

export function indexedCount(event: AbiEvent) {
  return event.inputs.filter(
    (input: AbiEvent['inputs'][number]) => input.indexed,
  ).length
}
