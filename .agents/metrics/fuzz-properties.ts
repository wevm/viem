/**
 * The structured properties the fuzz category runs: round trips for every encode/decode pair,
 * differentials against ox and ethers, and consistency between functions that must agree. Each
 * property lists the public functions it exercises (`covers`), and its failure names the function
 * at fault (`blame`) when the check can tell, such as the odd one out of viem, ox, and ethers.
 *
 * Inputs are well-formed for the function's types (fast-check arbitraries), so any error a call
 * throws is a failure too, except where a check expects one of viem's documented errors.
 *
 * @module
 */

import type fcModule from 'fast-check'

type Fc = typeof fcModule
type Arbitrary<value = unknown> = fcModule.Arbitrary<value>
type Module = Record<string, unknown>
type Any = any

export type Lib = {
  /** viem's entry points by public name, such as `viem/siwe`. */
  v: Record<string, Module>
  /** ox's modules, such as `Hex` or `tempo/TxEnvelopeTempo`. */
  ox: Record<string, Module>
  ethers: Any
  fc: Fc
  BaseError: new (...args: never[]) => Error
  root: string
}

export type Property = {
  id: string
  oracle: 'round trip' | 'differential' | 'consistency' | 'crash'
  covers: string[]
  runs: number
  async?: boolean | undefined
  arb: Arbitrary
  check: (input: Any) => void | Promise<void>
}

/** A property's failure, with the functions at fault when the check can tell. */
export class Failure extends Error {
  blame?: string[] | undefined
  kind: string
  site?: string | undefined
  constructor(
    message: string,
    options: {
      blame?: string[] | undefined
      kind?: string
      site?: string
    } = {},
  ) {
    super(message)
    this.blame = options.blame
    this.kind = options.kind ?? 'mismatch'
    this.site = options.site
  }
}

export function properties(lib: Lib): Property[] {
  const { fc, ethers } = lib
  const fn = (name: string): Any => {
    const [entry, path] = name.split(':') as [string, string]
    let value: Any = lib.v[entry]
    for (const part of path.split('.')) value = value?.[part]
    if (typeof value !== 'function')
      throw new Error(`${name} is not a function`)
    return value
  }
  const ox = (name: string): Any => {
    const module = lib.ox[name]
    if (!module) throw new Error(`ox has no ${name}`)
    return module
  }
  const documented = (error: unknown) =>
    error instanceof Error &&
    ![TypeError, RangeError, SyntaxError, ReferenceError].includes(
      Object.getPrototypeOf(error)?.constructor,
    )

  /** Calls a viem function; any error is that function's failure. */
  const call = (name: string, ...args: unknown[]): Any => {
    try {
      return fn(name)(...args)
    } catch (error) {
      throw crash(name, error)
    }
  }
  const callAsync = async (name: string, ...args: unknown[]): Promise<Any> => {
    try {
      return await fn(name)(...args)
    } catch (error) {
      throw crash(name, error)
    }
  }
  const crash = (name: string, error: unknown) =>
    new Failure(
      `${short(name)} threw ${(error as Error)?.name ?? typeof error}: ${(error as Error)?.message?.split('\n')[0] ?? String(error)}`,
      {
        blame: [name],
        kind: documented(error)
          ? 'threw on valid input'
          : `${(error as Error)?.name ?? 'non-Error'}`,
        site: siteOf(error),
      },
    )
  /** Expects a viem function to reject an invalid input with a documented error. */
  const rejects = (name: string, why: string, ...args: unknown[]) => {
    let result: unknown
    try {
      result = fn(name)(...args)
    } catch (error) {
      if (documented(error)) return
      throw crash(name, error)
    }
    throw new Failure(
      `${short(name)} accepted ${why} and returned ${show(result)}`,
      { blame: [name], kind: 'accepted invalid input' },
    )
  }
  /** Runs a reference implementation; `undefined` when it rejects the input. */
  const attempt = <value>(thunk: () => value): value | undefined => {
    try {
      return thunk()
    } catch {
      return undefined
    }
  }
  const same = (
    name: string | string[],
    actual: unknown,
    expected: unknown,
    what: string,
  ) => {
    if (!equal(actual, expected))
      throw new Failure(
        `${what}: got ${show(actual)}, expected ${show(expected)}`,
        { blame: Array.isArray(name) ? name : [name] },
      )
  }
  /** Blames the odd one out of viem, ox, and ethers; ethers alone disagreeing is not viem's. */
  const vote = (
    name: string,
    values: { viem: unknown; ox?: unknown; ethers?: unknown },
    what: string,
  ) => {
    const { viem } = values
    // A reference that rejected the input (`attempt` gave `undefined`) has no say.
    const refs = (['ox', 'ethers'] as const).filter(
      (key) => key in values && values[key] !== undefined,
    )
    const disagree = refs.filter((key) => !equal(viem, values[key]))
    if (!disagree.length) return
    if (
      refs.length === 2 &&
      disagree.length === 1 &&
      equal(viem, values[refs.find((key) => !disagree.includes(key))!])
    )
      return // viem has a second implementation on its side.
    throw new Failure(
      `${what}: viem ${show(viem)}, ${disagree.map((key) => `${key} ${show(values[key])}`).join(', ')}`,
      { blame: [name] },
    )
  }

  // -------------------------------------------------------------------------------------------
  // Arbitraries.

  const hexOf = (min: number, max: number) =>
    fc.uint8Array({ minLength: min, maxLength: max }).map(toHex)
  const bytesOf = (min: number, max: number) =>
    fc.uint8Array({ minLength: min, maxLength: max })
  const address = hexOf(20, 20)
  const hash = hexOf(32, 32)
  const uint = (bits: number) =>
    fc.bigInt({ min: 0n, max: 2n ** BigInt(bits) - 1n })
  const int = (bits: number) =>
    fc.bigInt({
      min: -(2n ** BigInt(bits - 1)),
      max: 2n ** BigInt(bits - 1) - 1n,
    })
  const text = fc.string({ unit: 'grapheme', maxLength: 40 })
  const privateKey = fc
    .bigInt({ min: 1n, max: secp256k1N - 1n })
    .map((value) => toHex32(value))
  const scalar = fc.bigInt({ min: 1n, max: secp256k1N - 1n })
  const signature = fc.record({
    r: scalar.map(toHex32),
    s: scalar.map(toHex32),
    yParity: fc.integer({ min: 0, max: 1 }),
  })
  const accessList = fc.array(
    fc.record({
      address,
      storageKeys: fc.array(hash, { maxLength: 3 }),
    }),
    { maxLength: 3 },
  )
  const quantity = fc.oneof(
    fc.constantFrom(0n, 1n, 127n, 128n, 255n, 256n, 2n ** 64n - 1n),
    uint(64),
    uint(256),
  )

  /** A random ABI parameter type, with its value arbitrary. */
  type Param = { type: string; name?: string; components?: Param[] }
  const elementary = fc.oneof(
    fc.integer({ min: 1, max: 32 }).map((n) => `uint${n * 8}`),
    fc.integer({ min: 1, max: 32 }).map((n) => `int${n * 8}`),
    fc.constantFrom('address', 'bool', 'bytes', 'string', 'uint256', 'bytes32'),
    fc.integer({ min: 1, max: 32 }).map((n) => `bytes${n}`),
  )
  const paramArb: Arbitrary<Param> = fc.letrec<{
    param: Param
    tuple: Param
    array: Param
  }>((tie) => ({
    param: fc.oneof(
      { depthSize: 'small', withCrossShrink: true },
      elementary.map((type) => ({ type })),
      tie('tuple'),
      tie('array'),
    ),
    tuple: fc
      .array(tie('param'), { minLength: 1, maxLength: 3 })
      .map((components) => ({
        type: 'tuple',
        components: components.map((component, i) => ({
          ...component,
          name: `f${i}`,
        })),
      })),
    array: fc
      .tuple(tie('param'), fc.option(fc.integer({ min: 1, max: 3 })))
      .map(([inner, length]) => ({
        ...inner,
        type: `${inner.type}[${length ?? ''}]`,
      })),
  })).param
  const arbitraryOf = (param: Param): Arbitrary => {
    const array = param.type.match(/^(.*)\[(\d*)\]$/)
    if (array) {
      const inner = arbitraryOf({ ...param, type: array[1]! })
      return array[2]
        ? fc.array(inner, {
            minLength: Number(array[2]),
            maxLength: Number(array[2]),
          })
        : fc.array(inner, { maxLength: 3 })
    }
    if (param.type === 'tuple')
      return fc
        .tuple(...param.components!.map(arbitraryOf))
        .map((values) =>
          Object.fromEntries(
            param.components!.map((component, i) => [
              component.name!,
              values[i],
            ]),
          ),
        )
    const sized = param.type.match(/^(u?int|bytes)(\d+)$/)
    if (sized?.[1] === 'uint') return uint(Number(sized[2]))
    if (sized?.[1] === 'int') return int(Number(sized[2]))
    if (sized?.[1] === 'bytes') return hexOf(Number(sized[2]), Number(sized[2]))
    if (param.type === 'address') return address
    if (param.type === 'bool') return fc.boolean()
    if (param.type === 'bytes') return hexOf(0, 70)
    if (param.type === 'string') return text
    throw new Error(`no arbitrary for ${param.type}`)
  }
  const paramsWithValues = fc
    .array(paramArb, { minLength: 0, maxLength: 4 })
    .chain((params) =>
      fc.tuple(fc.constant(params), fc.tuple(...params.map(arbitraryOf))),
    )
  /** A random function ABI item with arguments and a result for it. */
  const fnAbi = fc
    .record({
      name: fc.stringMatching(/^[a-zA-Z_][a-zA-Z0-9_]{0,12}$/),
      inputs: paramsWithValues,
      outputs: paramsWithValues,
    })
    .map(({ name, inputs, outputs }) => ({
      abi: [
        {
          type: 'function',
          name,
          stateMutability: 'nonpayable',
          inputs: inputs[0],
          outputs: outputs[0],
        },
      ] as Any,
      name,
      args: inputs[1],
      result: outputs[1],
    }))
  /** A value in the shape decoders return: tuples as objects, addresses lowercase. */
  const canonical = (value: unknown): unknown => {
    if (typeof value === 'string' && /^0x/.test(value))
      return value.toLowerCase()
    // viem decodes (u)int8 to (u)int48 as numbers, by design.
    if (typeof value === 'number' && Number.isSafeInteger(value))
      return BigInt(value)
    if (Array.isArray(value)) return value.map(canonical)
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, canonical(item)]),
      )
    return value
  }
  /** An ethers `Result` as plain arrays, keyed like `canonical` for tuples. */
  const fromEthers = (param: Param, value: Any): unknown => {
    const array = param.type.match(/^(.*)\[(\d*)\]$/)
    if (array)
      return [...value].map((item) =>
        fromEthers({ ...param, type: array[1]! }, item),
      )
    if (param.type === 'tuple')
      return Object.fromEntries(
        param.components!.map((component, i) => [
          component.name!,
          fromEthers(component, value[i]),
        ]),
      )
    return canonical(value)
  }
  const toEthers = (param: Param, value: Any): unknown => {
    const array = param.type.match(/^(.*)\[(\d*)\]$/)
    if (array)
      return value.map((item: unknown) =>
        toEthers({ ...param, type: array[1]! }, item),
      )
    if (param.type === 'tuple')
      return param.components!.map((component) =>
        toEthers(component, value[component.name!]),
      )
    return value
  }

  // -------------------------------------------------------------------------------------------
  // Properties.

  const props: Property[] = []
  const add = (prop: Property) => props.push(prop)

  // Numbers and bigints to hex and bytes, with sizes and signs.
  {
    const sizedNumber = fc
      .record({
        size: fc.option(fc.integer({ min: 1, max: 32 }), { nil: undefined }),
        signed: fc.boolean(),
      })
      .chain(({ size, signed: signed_ }) => {
        // Signed values need a size: without one, the width (and so the sign bit) is unknown.
        const signed = signed_ && size !== undefined
        const bits = (size ?? 32) * 8
        return fc.record({
          size: fc.constant(size),
          signed: fc.constant(signed),
          value: signed ? int(bits) : uint(bits),
        })
      })
    add({
      id: 'round trip: number ↔ hex',
      oracle: 'round trip',
      covers: [
        'viem:numberToHex',
        'viem:hexToBigInt',
        'viem:hexToNumber',
        'viem:toHex',
        'viem:fromHex',
      ],
      runs: 300,
      arb: sizedNumber,
      check({ value, size, signed }) {
        const hex = call('viem:numberToHex', value, { size, signed })
        if (size !== undefined)
          same(
            'viem:numberToHex',
            (hex.length - 2) / 2,
            size,
            'size of numberToHex output',
          )
        same(
          'viem:toHex',
          call('viem:toHex', value, { size, signed }),
          hex,
          'toHex agrees with numberToHex',
        )
        same(
          'viem:hexToBigInt',
          call('viem:hexToBigInt', hex, { size, signed }),
          value,
          'hexToBigInt(numberToHex(x))',
        )
        same(
          'viem:fromHex',
          call('viem:fromHex', hex, { to: 'bigint', size, signed }),
          value,
          'fromHex(…, bigint)',
        )
        if (
          value >= BigInt(Number.MIN_SAFE_INTEGER) &&
          value <= BigInt(Number.MAX_SAFE_INTEGER)
        )
          same(
            'viem:hexToNumber',
            call('viem:hexToNumber', hex, { size, signed }),
            Number(value),
            'hexToNumber(numberToHex(x))',
          )
        vote(
          'viem:numberToHex',
          {
            viem: hex,
            ox: attempt(() => ox('Hex').fromNumber(value, { size, signed })),
            ...(!signed && size !== undefined
              ? { ethers: attempt(() => ethers.toBeHex(value, size)) }
              : {}),
          },
          'numberToHex',
        )
      },
    })
    add({
      id: 'round trip: number ↔ bytes',
      oracle: 'round trip',
      covers: [
        'viem:numberToBytes',
        'viem:bytesToBigInt',
        'viem:bytesToNumber',
        'viem:toBytes',
        'viem:fromBytes',
      ],
      runs: 300,
      arb: sizedNumber,
      check({ value, size, signed }) {
        const bytes = call('viem:numberToBytes', value, { size, signed })
        if (size !== undefined)
          same(
            'viem:numberToBytes',
            bytes.length,
            size,
            'length of numberToBytes output',
          )
        same(
          'viem:toBytes',
          call('viem:toBytes', value, { size, signed }),
          bytes,
          'toBytes agrees with numberToBytes',
        )
        same(
          'viem:bytesToBigInt',
          call('viem:bytesToBigInt', bytes, { size, signed }),
          value,
          'bytesToBigInt(numberToBytes(x))',
        )
        same(
          'viem:fromBytes',
          call('viem:fromBytes', bytes, { to: 'bigint', size, signed }),
          value,
          'fromBytes(…, bigint)',
        )
        if (
          value >= BigInt(Number.MIN_SAFE_INTEGER) &&
          value <= BigInt(Number.MAX_SAFE_INTEGER)
        )
          same(
            'viem:bytesToNumber',
            call('viem:bytesToNumber', bytes, { size, signed }),
            Number(value),
            'bytesToNumber(numberToBytes(x))',
          )
      },
    })
    add({
      id: 'consistency: out-of-range integers are rejected',
      oracle: 'consistency',
      covers: ['viem:numberToHex', 'viem:numberToBytes'],
      runs: 200,
      arb: fc
        .record({
          size: fc.integer({ min: 1, max: 32 }),
          signed: fc.boolean(),
          over: fc.bigInt({ min: 0n, max: 2n ** 70n }),
          below: fc.boolean(),
        })
        .map(({ size, signed, over, below }) => {
          const bits = BigInt(size * 8)
          const max = signed ? 2n ** (bits - 1n) - 1n : 2n ** bits - 1n
          const min = signed ? -(2n ** (bits - 1n)) : 0n
          return {
            size,
            signed,
            value: below ? min - 1n - over : max + 1n + over,
          }
        }),
      check({ size, signed, value }) {
        rejects(
          'viem:numberToHex',
          `${value}n, out of range for ${signed ? 'int' : 'uint'}${size * 8}`,
          value,
          { size, signed },
        )
        rejects(
          'viem:numberToBytes',
          `${value}n, out of range for ${signed ? 'int' : 'uint'}${size * 8}`,
          value,
          { size, signed },
        )
      },
    })
    add({
      id: 'consistency: non-integer numbers are rejected',
      oracle: 'consistency',
      covers: ['viem:numberToHex', 'viem:toHex'],
      runs: 100,
      arb: fc.oneof(
        fc.double({ noInteger: true, noNaN: true }),
        fc.constantFrom(
          Number.NaN,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
        ),
      ),
      check(value) {
        // A fraction cannot be hex. Any error will do (BigInt's RangeError names the number), but
        // returning a string is wrong output.
        for (const name of ['viem:numberToHex', 'viem:toHex']) {
          let result: unknown
          try {
            result = fn(name)(value)
          } catch {
            continue
          }
          throw new Failure(
            `${short(name)} accepted the non-integer ${value} and returned ${show(result)}`,
            { blame: [name], kind: 'wrong output' },
          )
        }
      },
    })
  }
  add({
    id: 'round trip: string ↔ hex/bytes',
    oracle: 'round trip',
    covers: [
      'viem:stringToHex',
      'viem:hexToString',
      'viem:stringToBytes',
      'viem:bytesToString',
    ],
    runs: 300,
    arb: fc.record({
      value: text,
      pad: fc.option(fc.integer({ min: 0, max: 8 }), { nil: undefined }),
    }),
    check({ value, pad }) {
      const length = new TextEncoder().encode(value).length
      // Padding a string ending in NUL loses the NULs, as documented trimming does.
      const size =
        pad === undefined || /\0$/.test(value) ? undefined : length + pad
      const hex = call('viem:stringToHex', value, { size })
      same(
        'viem:hexToString',
        call('viem:hexToString', hex, { size }),
        value,
        'hexToString(stringToHex(s))',
      )
      const bytes = call('viem:stringToBytes', value, { size })
      same(
        'viem:bytesToString',
        call('viem:bytesToString', bytes, { size }),
        value,
        'bytesToString(stringToBytes(s))',
      )
      vote(
        'viem:stringToBytes',
        {
          viem: call('viem:stringToBytes', value),
          ethers: ethers.toUtf8Bytes(value),
        },
        'UTF-8 bytes',
      )
    },
  })
  add({
    id: 'round trip: bool ↔ hex/bytes',
    oracle: 'round trip',
    covers: [
      'viem:boolToHex',
      'viem:hexToBool',
      'viem:boolToBytes',
      'viem:bytesToBool',
    ],
    runs: 60,
    arb: fc.record({
      value: fc.boolean(),
      size: fc.option(fc.integer({ min: 1, max: 32 }), { nil: undefined }),
    }),
    check({ value, size }) {
      same(
        'viem:hexToBool',
        call('viem:hexToBool', call('viem:boolToHex', value, { size }), {
          size,
        }),
        value,
        'hexToBool(boolToHex(b))',
      )
      same(
        'viem:bytesToBool',
        call('viem:bytesToBool', call('viem:boolToBytes', value, { size }), {
          size,
        }),
        value,
        'bytesToBool(boolToBytes(b))',
      )
    },
  })
  add({
    id: 'consistency: hexToBool rejects values other than 0 and 1',
    oracle: 'consistency',
    covers: ['viem:hexToBool', 'viem:bytesToBool'],
    runs: 100,
    arb: uint(256).filter((value) => value > 1n),
    check(value) {
      const hex = `0x${value.toString(16).padStart(64, '0')}`
      rejects('viem:hexToBool', `${hex}, which is neither 0 nor 1`, hex)
      rejects(
        'viem:bytesToBool',
        `${hex} as bytes, which is neither 0 nor 1`,
        hexBytes(hex),
      )
    },
  })
  add({
    id: 'round trip: bytes ↔ hex',
    oracle: 'round trip',
    covers: ['viem:bytesToHex', 'viem:hexToBytes'],
    runs: 300,
    arb: fc.record({ bytes: bytesOf(0, 80), upper: fc.boolean() }),
    check({ bytes, upper }) {
      const hex = call('viem:bytesToHex', bytes)
      vote(
        'viem:bytesToHex',
        { viem: hex, ethers: ethers.hexlify(bytes) },
        'bytesToHex',
      )
      const input = upper ? `0x${hex.slice(2).toUpperCase()}` : hex
      same(
        'viem:hexToBytes',
        call('viem:hexToBytes', input),
        bytes,
        'hexToBytes(bytesToHex(b))',
      )
    },
  })
  add({
    id: 'differential: hexToBytes rejects what is not hex',
    oracle: 'differential',
    covers: ['viem:hexToBytes', 'viem:toBytes'],
    runs: 300,
    arb: fc
      .tuple(
        fc.string({
          unit: fc.constantFrom(...'0123456789abcdefABCDEFgxz -'),
          maxLength: 12,
        }),
      )
      .map(([body]) => `0x${body}`),
    check(hex) {
      // Odd-length hex is padded on the left by design, so only characters are judged here.
      if (/^0x[0-9a-fA-F]*$/.test(hex)) return
      rejects(
        'viem:hexToBytes',
        `${JSON.stringify(hex)}, which is not hex`,
        hex,
      )
    },
  })

  // size, pad, trim, slice, and concat agree between hex and bytes.
  {
    const data = fc.record({
      bytes: bytesOf(0, 40),
      size: fc.integer({ min: 0, max: 48 }),
      dir: fc.constantFrom('left', 'right', undefined),
    })
    add({
      id: 'consistency: pad/trim/size on hex and bytes agree',
      oracle: 'consistency',
      covers: [
        'viem:pad',
        'viem:padHex',
        'viem:padBytes',
        'viem:trim',
        'viem:size',
      ],
      runs: 300,
      arb: data,
      check({ bytes, size, dir }) {
        const hex = toHex(bytes)
        same('viem:size', call('viem:size', hex), bytes.length, 'size(hex)')
        same('viem:size', call('viem:size', bytes), bytes.length, 'size(bytes)')
        if (bytes.length > size) {
          rejects('viem:padHex', `${hex} into ${size} bytes`, hex, {
            size,
            dir,
          })
          rejects(
            'viem:padBytes',
            `${bytes.length} bytes into ${size}`,
            bytes,
            { size, dir },
          )
        } else {
          const paddedHex = call('viem:padHex', hex, { size, dir })
          const paddedBytes = call('viem:padBytes', bytes, { size, dir })
          same(
            'viem:padHex',
            paddedHex,
            toHex(paddedBytes),
            'padHex agrees with padBytes',
          )
          same(
            'viem:padHex',
            call('viem:size', paddedHex),
            size,
            'size(padHex(x, {size}))',
          )
          same(
            'viem:pad',
            call('viem:pad', hex, { size, dir }),
            paddedHex,
            'pad agrees with padHex',
          )
        }
        const trimDir = dir ?? 'left'
        const trimmedHex = call('viem:trim', hex, { dir: trimDir })
        const trimmedBytes = call('viem:trim', bytes, { dir: trimDir })
        same(
          'viem:trim',
          hexBytes(trimmedHex),
          trimmedBytes,
          `trim(hex, ${trimDir}) agrees with trim(bytes, ${trimDir})`,
        )
        // Trimming keeps the value: the trimmed bytes padded back are the input, when it was padded.
        const expected = trimBytes(bytes, trimDir)
        same(
          'viem:trim',
          trimmedBytes,
          expected,
          `trim(bytes, ${trimDir}) drops only zero bytes`,
        )
      },
    })
    add({
      id: 'consistency: slice on hex and bytes agree',
      oracle: 'consistency',
      covers: ['viem:slice', 'viem:sliceHex', 'viem:sliceBytes'],
      runs: 300,
      arb: fc.record({
        bytes: bytesOf(0, 24),
        start: fc.option(fc.integer({ min: -4, max: 28 }), { nil: undefined }),
        end: fc.option(fc.integer({ min: -4, max: 28 }), { nil: undefined }),
        strict: fc.boolean(),
      }),
      check({ bytes, start, end, strict }) {
        const hex = toHex(bytes)
        const outcome = (thunk: () => unknown) => {
          try {
            return { value: thunk() }
          } catch (error) {
            if (!documented(error)) throw error
            return { error: (error as Error).name }
          }
        }
        let fromHex: Any
        let fromBytes: Any
        try {
          fromHex = outcome(() =>
            fn('viem:sliceHex')(hex, start, end, { strict }),
          )
        } catch (error) {
          throw crash('viem:sliceHex', error)
        }
        try {
          fromBytes = outcome(() =>
            fn('viem:sliceBytes')(bytes, start, end, { strict }),
          )
        } catch (error) {
          throw crash('viem:sliceBytes', error)
        }
        const view = (result: Any) =>
          'value' in result
            ? toHex(
                result.value instanceof Uint8Array
                  ? result.value
                  : hexBytes(result.value),
              )
            : `throws ${result.error}`
        if (view(fromHex) !== view(fromBytes))
          throw new Failure(
            `sliceHex(${hex}, ${start}, ${end}, {strict: ${strict}}) → ${view(fromHex)}, sliceBytes → ${view(fromBytes)}`,
            { blame: ['viem:sliceHex', 'viem:sliceBytes'] },
          )
        // Array.prototype.slice is the reference when both succeed.
        if ('value' in fromBytes) {
          const reference = toHex(bytes.slice(start, end))
          same(
            ['viem:sliceBytes', 'viem:sliceHex'],
            view(fromBytes),
            reference,
            `slice(${start}, ${end}) of ${bytes.length} bytes`,
          )
        }
      },
    })
    add({
      id: 'consistency: concat on hex and bytes agree',
      oracle: 'consistency',
      covers: ['viem:concat', 'viem:concatHex', 'viem:concatBytes'],
      runs: 200,
      arb: fc.array(bytesOf(0, 12), { maxLength: 5 }),
      check(parts) {
        const hex = call('viem:concatHex', parts.map(toHex))
        const bytes = call('viem:concatBytes', parts)
        same(
          'viem:concatHex',
          hex,
          toHex(bytes),
          'concatHex agrees with concatBytes',
        )
        same(
          'viem:concat',
          call('viem:concat', parts.map(toHex)),
          hex,
          'concat(hex[]) agrees with concatHex',
        )
        same(
          'viem:concatBytes',
          bytes,
          Uint8Array.from(parts.flatMap((part) => [...part])),
          'concatBytes',
        )
      },
    })
    add({
      id: 'consistency: isHex and isBytes',
      oracle: 'consistency',
      covers: ['viem:isHex', 'viem:isBytes', 'viem:isHash'],
      runs: 300,
      arb: fc.oneof(
        fc
          .string({
            unit: fc.constantFrom(...'0123456789abcdefABCDEFx g'),
            maxLength: 70,
          })
          .map((body) => `0x${body}`),
        fc.string({ maxLength: 8 }),
        bytesOf(0, 8),
        fc.constantFrom(null, undefined, 0, 1n, {}, []),
      ),
      check(value) {
        const hex = typeof value === 'string' && /^0x[0-9a-fA-F]*$/.test(value)
        same(
          'viem:isHex',
          call('viem:isHex', value),
          hex,
          `isHex(${show(value)})`,
        )
        same(
          'viem:isHex',
          call('viem:isHex', value, { strict: false }),
          typeof value === 'string' && value.startsWith('0x'),
          `isHex(${show(value)}, {strict: false})`,
        )
        same(
          'viem:isBytes',
          call('viem:isBytes', value),
          value instanceof Uint8Array,
          `isBytes(${show(value)})`,
        )
        same(
          'viem:isHash',
          call('viem:isHash', value),
          hex && (value as string).length === 66,
          `isHash(${show(value)})`,
        )
      },
    })
  }

  // RLP.
  {
    type Rlp = string | Rlp[]
    const rlpArb: Arbitrary<Rlp> = fc.letrec<{ item: Rlp }>((tie) => ({
      item: fc.oneof(
        { depthSize: 'small' },
        fc.oneof(hexOf(0, 2), hexOf(0, 60), hexOf(54, 58)),
        fc.array(tie('item'), { maxLength: 4 }),
      ),
    })).item
    add({
      id: 'round trip: RLP',
      oracle: 'round trip',
      covers: [
        'viem:toRlp',
        'viem:fromRlp',
        'viem:bytesToRlp',
        'viem:hexToRlp',
      ],
      runs: 300,
      arb: rlpArb,
      check(value) {
        const encoded = call('viem:toRlp', value)
        vote(
          'viem:toRlp',
          {
            viem: encoded,
            ethers: ethers.encodeRlp(value),
            ox: ox('Rlp').fromHex(value),
          },
          'RLP encoding',
        )
        same(
          'viem:fromRlp',
          call('viem:fromRlp', encoded, 'hex'),
          value,
          'fromRlp(toRlp(x))',
        )
        const asBytes = mapRlp(value, hexBytes)
        same(
          'viem:toRlp',
          call('viem:toRlp', asBytes, 'bytes'),
          hexBytes(encoded),
          'toRlp(bytes) agrees with toRlp(hex)',
        )
        same(
          'viem:fromRlp',
          call('viem:fromRlp', hexBytes(encoded), 'bytes'),
          asBytes,
          'fromRlp(bytes)',
        )
        if (typeof value === 'string') {
          same(
            'viem:hexToRlp',
            call('viem:hexToRlp', value),
            encoded,
            'hexToRlp',
          )
          same(
            'viem:bytesToRlp',
            call('viem:bytesToRlp', hexBytes(value), 'hex'),
            encoded,
            'bytesToRlp',
          )
        }
      },
    })
    add({
      id: 'differential: RLP decoding of malformed input',
      oracle: 'differential',
      covers: ['viem:fromRlp'],
      runs: 400,
      arb: fc
        .tuple(
          rlpArb,
          fc.nat(),
          fc.integer({ min: 0, max: 5 }),
          fc.uint8Array({ minLength: 1, maxLength: 3 }),
        )
        .map(([value, at, how, junk]) => {
          const bytes = hexBytes(ethers.encodeRlp(value))
          const index = bytes.length ? at % bytes.length : 0
          const out = [...bytes]
          if (how === 0) out.splice(index, 1)
          else if (how === 1) out.push(...junk)
          else if (how === 2) out[index] = junk[0]!
          else if (how === 3) out.splice(index, 0, junk[0]!)
          else if (how === 4) out.length = index
          else out.unshift(0x81, junk[0]! & 0x7f)
          return toHex(Uint8Array.from(out))
        }),
      check(hex) {
        // viem decodes empty input to `0x` on purpose (fromRlp.test.ts asserts it), as ox does.
        if (hex === '0x') return
        const expected = attempt(() => ethers.decodeRlp(hex))
        let actual: unknown
        try {
          actual = fn('viem:fromRlp')(hex, 'hex')
        } catch (error) {
          if (!documented(error)) throw crash('viem:fromRlp', error)
          return // Rejecting malformed RLP is right whatever ethers does.
        }
        if (expected === undefined)
          throw new Failure(
            `fromRlp accepted malformed RLP ${hex} (ethers rejects it) and returned ${show(actual)}`,
            { blame: ['viem:fromRlp'], kind: 'accepted invalid input' },
          )
        same('viem:fromRlp', actual, expected, `fromRlp(${hex})`)
      },
    })
  }

  // ABI parameters, function data, results, errors, events, deploy data, and packed encoding.
  {
    add({
      id: 'round trip: ABI parameters (differential with ethers and ox)',
      oracle: 'round trip',
      covers: ['viem:encodeAbiParameters', 'viem:decodeAbiParameters'],
      runs: 250,
      arb: paramsWithValues,
      check([params, values]) {
        const encoded = call('viem:encodeAbiParameters', params, values)
        vote(
          'viem:encodeAbiParameters',
          {
            viem: encoded,
            ethers: attempt(() =>
              ethers.AbiCoder.defaultAbiCoder().encode(
                params,
                params.map((param: Param, i: number) =>
                  toEthers(param, values[i]),
                ),
              ),
            ),
            ox: attempt(() => ox('AbiParameters').encode(params, values)),
          },
          'ABI encoding',
        )
        const decoded = call('viem:decodeAbiParameters', params, encoded)
        same(
          'viem:decodeAbiParameters',
          canonical(decoded),
          canonical(values),
          'decodeAbiParameters(encodeAbiParameters(x))',
        )
      },
    })
    add({
      id: 'consistency: decoded integers fit their ABI type',
      oracle: 'consistency',
      covers: ['viem:decodeAbiParameters'],
      runs: 300,
      arb: fc.record({
        bits: fc.integer({ min: 1, max: 31 }).map((n) => n * 8),
        signed: fc.boolean(),
        word: fc.oneof(
          uint(256),
          fc.constantFrom(
            2n ** 256n - 1n,
            2n ** 255n,
            255n,
            2n ** 64n,
            2n ** 128n + 1n,
          ),
        ),
      }),
      check({ bits, signed, word }) {
        // A word outside the type's range is not a valid encoding: solc's decoder reverts on it,
        // and ox throws. Returning it as the type's value is wrong output.
        const type = `${signed ? 'int' : 'uint'}${bits}`
        const data = `0x${word.toString(16).padStart(64, '0')}`
        let decoded: unknown
        try {
          ;[decoded] = fn('viem:decodeAbiParameters')([{ type }], data)
        } catch (error) {
          if (documented(error)) return
          throw crash('viem:decodeAbiParameters', error)
        }
        const value = BigInt(decoded as bigint)
        const min = signed ? -(2n ** BigInt(bits - 1)) : 0n
        const max = signed
          ? 2n ** BigInt(bits - 1) - 1n
          : 2n ** BigInt(bits) - 1n
        if (value < min || value > max)
          throw new Failure(
            `decodeAbiParameters([{type: '${type}'}], ${data}) returned ${decoded}, outside ${type} (${min} to ${max}); ox throws ${attempt(() => ox('AbiParameters').decode([{ type }], data)) === undefined ? 'an error' : 'nothing'}`,
            { blame: ['viem:decodeAbiParameters'], kind: 'wrong output' },
          )
      },
    })
    add({
      id: 'differential: ABI decoding of malformed data',
      oracle: 'differential',
      covers: ['viem:decodeAbiParameters'],
      runs: 300,
      arb: paramsWithValues
        .filter(([params]) => params.length > 0)
        .chain(([params, values]) =>
          fc.tuple(
            fc.constant(params),
            fc.constant(values),
            fc.nat(),
            fc.integer({ min: 0, max: 3 }),
            fc.uint8Array({ minLength: 1, maxLength: 32 }),
          ),
        )
        .map(([params, values, at, how, junk]) => {
          const bytes = [
            ...hexBytes(
              ethers.AbiCoder.defaultAbiCoder().encode(
                params,
                params.map((param: Param, i: number) =>
                  toEthers(param, values[i]),
                ),
              ),
            ),
          ]
          const index = bytes.length ? at % bytes.length : 0
          if (how === 0) bytes.length = index
          else if (how === 1) bytes[index] = junk[0]!
          else if (how === 2) bytes.splice(index, 0, ...junk)
          else bytes.splice(index, junk.length)
          return { params, data: toHex(Uint8Array.from(bytes)) }
        }),
      check({ params, data }) {
        let actual: unknown
        try {
          actual = fn('viem:decodeAbiParameters')(params, data)
        } catch (error) {
          if (!documented(error)) throw crash('viem:decodeAbiParameters', error)
          return
        }
        // ethers' Result throws on access when a value failed to decode, so read it all here.
        const expected = attempt(() => {
          const result = ethers.AbiCoder.defaultAbiCoder().decode(params, data)
          return params.map((param: Param, i: number) =>
            fromEthers(param, result[i]),
          )
        })
        if (expected === undefined) return // ethers is stricter in places viem is lenient by design.
        same(
          'viem:decodeAbiParameters',
          canonical(actual),
          expected,
          'decodeAbiParameters of mutated data',
        )
      },
    })
    add({
      id: 'round trip: function data and results',
      oracle: 'round trip',
      covers: [
        'viem:encodeFunctionData',
        'viem:decodeFunctionData',
        'viem:encodeFunctionResult',
        'viem:decodeFunctionResult',
        'viem:getFunctionSelector',
        'viem:prepareEncodeFunctionData',
      ],
      runs: 150,
      arb: fnAbi,
      check({ abi, name, args, result }) {
        const data = call('viem:encodeFunctionData', {
          abi,
          functionName: name,
          args,
        })
        const iface = new ethers.Interface(abi)
        vote(
          'viem:encodeFunctionData',
          {
            viem: data,
            ethers: attempt(() =>
              iface.encodeFunctionData(
                name,
                abi[0].inputs.map((param: Param, i: number) =>
                  toEthers(param, args[i]),
                ),
              ),
            ),
          },
          'function data',
        )
        same(
          'viem:getFunctionSelector',
          call('viem:getFunctionSelector', abi[0]),
          data.slice(0, 10),
          'selector',
        )
        const decoded = call('viem:decodeFunctionData', { abi, data })
        same(
          'viem:decodeFunctionData',
          decoded.functionName,
          name,
          'decoded function name',
        )
        same(
          'viem:decodeFunctionData',
          canonical(decoded.args ?? []),
          canonical(args),
          'decodeFunctionData(encodeFunctionData(x))',
        )
        const outputs = abi[0].outputs
        const value = outputs.length === 1 ? result[0] : result
        const encoded = call('viem:encodeFunctionResult', {
          abi,
          functionName: name,
          result: outputs.length ? value : undefined,
        })
        same(
          'viem:encodeFunctionResult',
          encoded,
          outputs.length
            ? call('viem:encodeAbiParameters', outputs, result)
            : '0x',
          'encodeFunctionResult agrees with encodeAbiParameters',
        )
        const back = call('viem:decodeFunctionResult', {
          abi,
          functionName: name,
          data: encoded,
        })
        same(
          'viem:decodeFunctionResult',
          canonical(back),
          outputs.length ? canonical(value) : undefined,
          'decodeFunctionResult(encodeFunctionResult(x))',
        )
      },
    })
    add({
      id: 'round trip: error results',
      oracle: 'round trip',
      covers: ['viem:encodeErrorResult', 'viem:decodeErrorResult'],
      runs: 150,
      arb: fnAbi.map(({ abi, name, args }) => ({
        abi: [{ type: 'error', name, inputs: abi[0].inputs }],
        name,
        args,
      })),
      check({ abi, name, args }) {
        const data = call('viem:encodeErrorResult', {
          abi,
          errorName: name,
          args,
        })
        const decoded = call('viem:decodeErrorResult', { abi, data })
        same(
          'viem:decodeErrorResult',
          decoded.errorName,
          name,
          'decoded error name',
        )
        same(
          'viem:decodeErrorResult',
          canonical(decoded.args ?? []),
          canonical(args),
          'decodeErrorResult(encodeErrorResult(x))',
        )
      },
    })
    add({
      id: 'round trip: event topics and logs',
      oracle: 'round trip',
      covers: [
        'viem:encodeEventTopics',
        'viem:decodeEventLog',
        'viem:parseEventLogs',
        'viem:getEventSelector',
      ],
      runs: 150,
      arb: fc
        .record({
          name: fc.stringMatching(/^[A-Z][a-zA-Z0-9]{0,10}$/),
          inputs: paramsWithValues,
          indexed: fc.array(fc.boolean(), { minLength: 4, maxLength: 4 }),
        })
        .map(({ name, inputs, indexed }) => {
          let count = 0
          const params = inputs[0].map((param: Param, i: number) => {
            // At most three indexed parameters, and only static ones, which decode back.
            const isIndexed = indexed[i]! && count < 3 && isStatic(param)
            if (isIndexed) count++
            return { ...param, name: `a${i}`, indexed: isIndexed }
          })
          return {
            abi: [{ type: 'event', name, inputs: params }],
            name,
            args: Object.fromEntries(
              params.map((param: Param, i: number) => [
                param.name,
                inputs[1][i],
              ]),
            ),
          }
        }),
      check({ abi, name, args }) {
        const inputs = abi[0].inputs
        const topics = call('viem:encodeEventTopics', {
          abi,
          eventName: name,
          args,
        })
        same(
          'viem:getEventSelector',
          call('viem:getEventSelector', abi[0]),
          topics[0],
          'event selector is topic 0',
        )
        const iface = new ethers.Interface(abi)
        vote(
          'viem:encodeEventTopics',
          {
            viem: topics,
            ethers: attempt(
              () =>
                iface.encodeEventLog(
                  name,
                  inputs.map((param: Any) => toEthers(param, args[param.name])),
                ).topics,
            ),
          },
          'event topics',
        )
        const unindexed = inputs.filter((param: Any) => !param.indexed)
        const data = call(
          'viem:encodeAbiParameters',
          unindexed,
          unindexed.map((param: Any) => args[param.name]),
        )
        const log = call('viem:decodeEventLog', { abi, data, topics })
        same('viem:decodeEventLog', log.eventName, name, 'decoded event name')
        same(
          'viem:decodeEventLog',
          canonical(log.args ?? {}),
          canonical(inputs.length ? args : {}),
          'decodeEventLog(encode(x))',
        )
        const parsed = call('viem:parseEventLogs', {
          abi,
          logs: [
            {
              data,
              topics,
              address: '0x0000000000000000000000000000000000000001',
              blockHash: null,
              blockNumber: null,
              logIndex: null,
              transactionHash: null,
              transactionIndex: null,
              removed: false,
            },
          ],
        })
        same(
          'viem:parseEventLogs',
          parsed.length,
          1,
          'parseEventLogs finds the log',
        )
      },
    })
    add({
      id: 'round trip: deploy data',
      oracle: 'round trip',
      covers: ['viem:encodeDeployData', 'viem:decodeDeployData'],
      runs: 100,
      arb: fc.record({
        inputs: paramsWithValues.filter(([params]) => params.length > 0),
        bytecode: hexOf(1, 40),
      }),
      check({ inputs, bytecode }) {
        const abi = [
          {
            type: 'constructor',
            stateMutability: 'nonpayable',
            inputs: inputs[0],
          },
        ]
        const data = call('viem:encodeDeployData', {
          abi,
          bytecode,
          args: inputs[1],
        })
        const decoded = call('viem:decodeDeployData', { abi, bytecode, data })
        same(
          'viem:decodeDeployData',
          canonical(decoded.args),
          canonical(inputs[1]),
          'decodeDeployData(encodeDeployData(x))',
        )
      },
    })
    const packedType = fc.oneof(
      elementary,
      elementary
        .filter((type) => type !== 'string' && type !== 'bytes')
        .map((type) => `${type}[]`),
    )
    add({
      id: 'differential: encodePacked against ethers and ox',
      oracle: 'differential',
      covers: ['viem:encodePacked'],
      runs: 300,
      arb: fc
        .array(packedType, { minLength: 1, maxLength: 4 })
        .chain((types) =>
          fc.tuple(
            fc.constant(types),
            fc.tuple(...types.map((type) => arbitraryOf({ type }))),
          ),
        ),
      check([types, values]) {
        const actual = call('viem:encodePacked', types, values)
        vote(
          'viem:encodePacked',
          {
            viem: actual,
            ethers: attempt(() => ethers.solidityPacked(types, values)),
            ox: attempt(() => ox('AbiParameters').encodePacked(types, values)),
          },
          `encodePacked(${JSON.stringify(types)})`,
        )
      },
    })
    add({
      id: 'round trip: formatAbiItem ↔ parseAbiItem',
      oracle: 'round trip',
      covers: [
        'viem/utils:formatAbiItem',
        'viem:parseAbiItem',
        'viem:getEventSignature',
        'viem:parseAbiParameters',
        'viem/utils:formatAbiParams',
      ],
      runs: 150,
      arb: fnAbi,
      check({ abi }) {
        const item = abi[0]
        const signature = call('viem/utils:formatAbiItem', item)
        same(
          'viem/utils:formatAbiItem',
          signature,
          ethers.FunctionFragment.from(item).format('sighash'),
          'formatAbiItem against ethers',
        )
        const params = call('viem/utils:formatAbiParams', item.inputs, {
          includeName: true,
        })
        if (item.inputs.length) {
          const parsed = call('viem:parseAbiParameters', params)
          same(
            'viem:parseAbiParameters',
            canonical(stripNames(parsed)),
            canonical(stripNames(item.inputs)),
            'parseAbiParameters(formatAbiParams(x))',
          )
        }
      },
    })
  }
  add({
    id: 'differential: getAddress and isAddress against ethers',
    oracle: 'differential',
    covers: [
      'viem:getAddress',
      'viem:checksumAddress',
      'viem:isAddress',
      'viem:isAddressEqual',
    ],
    runs: 300,
    arb: fc.record({
      address,
      mix: fc.array(fc.boolean(), { minLength: 40, maxLength: 40 }),
      mode: fc.integer({ min: 0, max: 3 }),
    }),
    check({ address, mix, mode }) {
      const checksummed = ethers.getAddress(address)
      const variant =
        mode === 0
          ? address
          : mode === 1
            ? checksummed
            : mode === 2
              ? `0x${address.slice(2).toUpperCase()}`
              : `0x${[...address.slice(2)].map((c, i) => (mix[i] ? c.toUpperCase() : c)).join('')}`
      same(
        'viem:getAddress',
        call('viem:getAddress', variant),
        checksummed,
        `getAddress(${variant})`,
      )
      same(
        'viem:checksumAddress',
        call('viem:checksumAddress', variant),
        checksummed,
        'checksumAddress',
      )
      same(
        'viem:getAddress',
        call('viem:getAddress', checksummed),
        checksummed,
        'checksums are idempotent',
      )
      // ethers accepts all-uppercase addresses as unchecksummed; viem and ox check them, and
      // EIP-55 does not settle it, so only the other variants are compared.
      if (mode !== 2)
        same(
          'viem:isAddress',
          call('viem:isAddress', variant),
          ethers.isAddress(variant),
          `isAddress(${variant}) against ethers`,
        )
      same(
        'viem:isAddress',
        call('viem:isAddress', variant, { strict: false }),
        true,
        'isAddress non-strict',
      )
      same(
        'viem:isAddressEqual',
        call('viem:isAddressEqual', variant, address),
        true,
        'isAddressEqual ignores case',
      )
    },
  })
  add({
    id: 'consistency: isAddress agrees with getAddress on arbitrary strings',
    oracle: 'consistency',
    covers: ['viem:isAddress', 'viem:getAddress'],
    runs: 300,
    arb: fc.oneof(
      fc
        .string({
          unit: fc.constantFrom(...'0123456789abcdefABCDEFxg'),
          minLength: 38,
          maxLength: 44,
        })
        .map((body) => `0x${body}`),
      fc.string({ maxLength: 44 }),
    ),
    check(value) {
      const valid = fn('viem:isAddress')(value, { strict: false })
      let checksummed: unknown
      try {
        checksummed = fn('viem:getAddress')(value)
      } catch (error) {
        if (!documented(error)) throw crash('viem:getAddress', error)
        if (valid)
          throw new Failure(
            `isAddress(${show(value)}, {strict: false}) is true but getAddress throws`,
            { blame: ['viem:isAddress', 'viem:getAddress'] },
          )
        return
      }
      if (!valid)
        throw new Failure(
          `getAddress(${show(value)}) returned ${show(checksummed)} but isAddress is false`,
          { blame: ['viem:isAddress', 'viem:getAddress'] },
        )
    },
  })
  add({
    id: 'differential: CREATE and CREATE2 addresses against ethers',
    oracle: 'differential',
    covers: [
      'viem:getContractAddress',
      'viem:getCreateAddress',
      'viem:getCreate2Address',
    ],
    runs: 200,
    arb: fc.record({
      from: address,
      nonce: fc.oneof(
        fc.constantFrom(
          0n,
          1n,
          0x7fn,
          0x80n,
          0xffn,
          0x100n,
          0xffffn,
          2n ** 32n,
          2n ** 64n - 1n,
        ),
        uint(64),
      ),
      salt: hash,
      bytecode: hexOf(0, 40),
    }),
    check({ from, nonce, salt, bytecode }) {
      const expected = ethers.getCreateAddress({ from, nonce })
      same(
        'viem:getCreateAddress',
        call('viem:getCreateAddress', { from, nonce }),
        expected,
        `CREATE address for nonce ${nonce}`,
      )
      same(
        'viem:getContractAddress',
        call('viem:getContractAddress', { from, nonce }),
        expected,
        'getContractAddress (CREATE)',
      )
      const create2 = ethers.getCreate2Address(
        from,
        salt,
        ethers.keccak256(bytecode),
      )
      same(
        'viem:getCreate2Address',
        call('viem:getCreate2Address', { from, salt, bytecode }),
        create2,
        'CREATE2 address',
      )
      same(
        'viem:getContractAddress',
        call('viem:getContractAddress', {
          from,
          salt,
          bytecode,
          opcode: 'CREATE2',
        }),
        create2,
        'getContractAddress (CREATE2)',
      )
    },
  })
  add({
    id: 'differential: keys to addresses against ethers',
    oracle: 'differential',
    covers: [
      'viem/accounts:privateKeyToAddress',
      'viem/accounts:publicKeyToAddress',
      'viem/accounts:privateKeyToAccount',
    ],
    runs: 60,
    arb: privateKey,
    check(key) {
      const wallet = new ethers.Wallet(key)
      same(
        'viem/accounts:privateKeyToAddress',
        call('viem/accounts:privateKeyToAddress', key),
        wallet.address,
        'privateKeyToAddress',
      )
      same(
        'viem/accounts:publicKeyToAddress',
        call('viem/accounts:publicKeyToAddress', wallet.signingKey.publicKey),
        wallet.address,
        'publicKeyToAddress',
      )
      same(
        'viem/accounts:privateKeyToAccount',
        call('viem/accounts:privateKeyToAccount', key).address,
        wallet.address,
        'privateKeyToAccount',
      )
    },
  })
  add({
    id: 'differential: keccak256, sha256, ripemd160 against ethers',
    oracle: 'differential',
    covers: ['viem:keccak256', 'viem:sha256', 'viem:ripemd160'],
    runs: 200,
    arb: bytesOf(0, 200),
    check(bytes) {
      const hex = toHex(bytes)
      same(
        'viem:keccak256',
        call('viem:keccak256', hex),
        ethers.keccak256(bytes),
        'keccak256(hex)',
      )
      same(
        'viem:keccak256',
        call('viem:keccak256', bytes, 'hex'),
        ethers.keccak256(bytes),
        'keccak256(bytes)',
      )
      same(
        'viem:sha256',
        call('viem:sha256', hex),
        ethers.sha256(bytes),
        'sha256',
      )
      same(
        'viem:ripemd160',
        call('viem:ripemd160', hex),
        ethers.ripemd160(bytes),
        'ripemd160',
      )
    },
  })
  add({
    id: 'differential: hashMessage against ethers',
    oracle: 'differential',
    covers: ['viem:hashMessage', 'viem:toPrefixedMessage'],
    runs: 200,
    arb: fc.oneof(
      text.map((value) => ({ value, kind: 'string' })),
      bytesOf(0, 60).map((value) => ({ value, kind: 'raw' })),
    ),
    check({ value, kind }) {
      const message = kind === 'string' ? value : { raw: value }
      same(
        'viem:hashMessage',
        call('viem:hashMessage', message),
        ethers.hashMessage(value),
        'hashMessage',
      )
      same(
        'viem:toPrefixedMessage',
        call('viem:keccak256', call('viem:toPrefixedMessage', message)),
        ethers.hashMessage(value),
        'keccak256(toPrefixedMessage(m))',
      )
    },
  })
  add({
    id: 'differential: namehash, labelhash, packetToBytes against ethers',
    oracle: 'differential',
    covers: [
      'viem:namehash',
      'viem:labelhash',
      'viem/ens:packetToBytes',
      'viem/ens:normalize',
    ],
    runs: 200,
    arb: fc
      .array(
        fc
          .stringMatching(/^[a-z0-9-]{1,12}$/)
          .filter((label) => !/^..--/.test(label) && !/^-|-$/.test(label)),
        { minLength: 1, maxLength: 4 },
      )
      .map((labels) => labels.join('.')),
    check(name) {
      same(
        'viem:namehash',
        call('viem:namehash', name),
        ethers.namehash(name),
        `namehash(${name})`,
      )
      const label = name.split('.')[0]!
      same(
        'viem:labelhash',
        call('viem:labelhash', label),
        ethers.id(label),
        'labelhash',
      )
      same(
        'viem/ens:normalize',
        call('viem/ens:normalize', name),
        ethers.ensNormalize(name),
        'normalize',
      )
      same(
        'viem/ens:packetToBytes',
        toHex(call('viem/ens:packetToBytes', name)),
        ethers.dnsEncode(name, 255),
        'packetToBytes against dnsEncode',
      )
    },
  })
  add({
    id: 'differential: function and event selectors against ethers',
    oracle: 'differential',
    covers: [
      'viem:getFunctionSelector',
      'viem:getEventSelector',
      'viem:getEventSignature',
    ],
    runs: 150,
    arb: fnAbi,
    check({ abi }) {
      const item = abi[0]
      const signature = ethers.FunctionFragment.from(item).format('sighash')
      same(
        'viem:getFunctionSelector',
        call('viem:getFunctionSelector', signature),
        ethers.id(signature).slice(0, 10),
        `selector of ${signature}`,
      )
      same(
        'viem:getEventSelector',
        call('viem:getEventSelector', `event ${signature}`),
        ethers.id(signature),
        'event selector',
      )
    },
  })

  // Typed data.
  {
    const primitive = fc.oneof(
      fc.integer({ min: 1, max: 32 }).map((n) => `uint${n * 8}`),
      fc.integer({ min: 1, max: 32 }).map((n) => `int${n * 8}`),
      fc.constantFrom(
        'address',
        'bool',
        'bytes',
        'string',
        'bytes32',
        'uint256',
      ),
      fc.integer({ min: 1, max: 32 }).map((n) => `bytes${n}`),
    )
    const typedData = fc
      .integer({ min: 1, max: 3 })
      .chain((count) =>
        fc.tuple(
          ...Array.from({ length: count }, (_, index) =>
            fc.array(
              fc
                .tuple(
                  index < count - 1
                    ? fc.oneof(
                        { weight: 4, arbitrary: primitive },
                        {
                          weight: 1,
                          arbitrary: fc
                            .integer({ min: index + 1, max: count - 1 })
                            .map((j) => `S${j}`),
                        },
                      )
                    : primitive,
                  fc.constantFrom('', '', '[]', '[2]'),
                )
                .map(([type, array]) => `${type}${array}`),
              { minLength: 1, maxLength: 4 },
            ),
          ),
        ),
      )
      .chain((structs) => {
        const types: Record<string, { name: string; type: string }[]> = {}
        structs.forEach((fields, i) => {
          types[`S${i}`] = fields.map((type, j) => ({ name: `f${j}`, type }))
          // Every struct is reachable from the primary type, as ethers requires.
          if (
            i < structs.length - 1 &&
            !fields.some((type) => type.startsWith(`S${i + 1}`))
          )
            types[`S${i}`]!.push({
              name: `f${fields.length}`,
              type: `S${i + 1}`,
            })
        })
        const valueFor = (type: string): Arbitrary => {
          const array = type.match(/^(.*)\[(\d*)\]$/)
          if (array) {
            const inner = valueFor(array[1]!)
            return array[2]
              ? fc.array(inner, {
                  minLength: Number(array[2]),
                  maxLength: Number(array[2]),
                })
              : fc.array(inner, { maxLength: 2 })
          }
          if (types[type])
            return fc
              .tuple(...types[type]!.map((field) => valueFor(field.type)))
              .map((values) =>
                Object.fromEntries(
                  types[type]!.map((field, i) => [field.name, values[i]]),
                ),
              )
          return arbitraryOf({ type })
        }
        const domain = fc.record(
          {
            name: text,
            version: fc.constantFrom('1', '2.0'),
            chainId: fc.oneof(
              fc.integer({ min: 1, max: 2 ** 40 }),
              fc.constant(1),
            ),
            verifyingContract: address,
            salt: hash,
          },
          { requiredKeys: [] },
        )
        return fc.record({
          types: fc.constant(types),
          primaryType: fc.constant('S0'),
          message: valueFor('S0'),
          domain,
        })
      })
    add({
      id: 'differential: EIP-712 hashes against ethers and ox',
      oracle: 'differential',
      covers: [
        'viem:hashTypedData',
        'viem:hashDomain',
        'viem:hashStruct',
        'viem:domainSeparator',
        'viem:validateTypedData',
        'viem:serializeTypedData',
        'viem:getTypesForEIP712Domain',
      ],
      runs: 200,
      arb: typedData,
      check({ types, primaryType, message, domain }) {
        call('viem:validateTypedData', { domain, types, primaryType, message })
        const actual = call('viem:hashTypedData', {
          domain,
          types,
          primaryType,
          message,
        })
        const ethersTypes = Object.fromEntries(Object.entries(types))
        vote(
          'viem:hashTypedData',
          {
            viem: actual,
            ethers: attempt(() =>
              ethers.TypedDataEncoder.hash(domain, ethersTypes, message),
            ),
            ox: attempt(() =>
              ox('TypedData').getSignPayload({
                domain,
                types,
                primaryType,
                message,
              }),
            ),
          },
          'hashTypedData',
        )
        vote(
          'viem:domainSeparator',
          {
            viem: call('viem:domainSeparator', { domain }),
            ethers: attempt(() => ethers.TypedDataEncoder.hashDomain(domain)),
          },
          'domainSeparator',
        )
        vote(
          'viem:hashStruct',
          {
            viem: call('viem:hashStruct', {
              data: message,
              primaryType,
              types,
            }),
            ethers: attempt(() =>
              ethers.TypedDataEncoder.hashStruct(
                primaryType,
                ethersTypes,
                message,
              ),
            ),
          },
          'hashStruct',
        )
        const serialized = call('viem:serializeTypedData', {
          domain,
          types,
          primaryType,
          message,
        })
        same(
          'viem:serializeTypedData',
          typeof JSON.parse(serialized),
          'object',
          'serializeTypedData is JSON',
        )
      },
    })
  }

  // Units.
  {
    const decimals = fc.integer({ min: 0, max: 40 })
    add({
      id: 'round trip: formatUnits ↔ parseUnits (and ethers)',
      oracle: 'round trip',
      covers: [
        'viem:formatUnits',
        'viem:parseUnits',
        'viem:formatEther',
        'viem:parseEther',
        'viem:formatGwei',
        'viem:parseGwei',
      ],
      runs: 400,
      arb: fc.record({
        value: fc.oneof(int(256), fc.bigInt({ min: -1000n, max: 1000n })),
        decimals,
      }),
      check({ value, decimals }) {
        const formatted = call('viem:formatUnits', value, decimals)
        same(
          'viem:parseUnits',
          call('viem:parseUnits', formatted, decimals),
          value,
          `parseUnits(formatUnits(${value}n, ${decimals}), ${decimals})`,
        )
        const reference = ethers
          .formatUnits(value, decimals)
          .replace(/\.0$/, '')
        same(
          'viem:formatUnits',
          formatted,
          reference,
          `formatUnits(${value}n, ${decimals}) against ethers`,
        )
        same(
          'viem:formatEther',
          call('viem:formatEther', value),
          ethers.formatEther(value).replace(/\.0$/, ''),
          'formatEther',
        )
        same(
          'viem:formatGwei',
          call('viem:formatGwei', value),
          ethers.formatUnits(value, 9).replace(/\.0$/, ''),
          'formatGwei',
        )
        same(
          'viem:parseEther',
          call('viem:parseEther', call('viem:formatEther', value)),
          value,
          'parseEther(formatEther(x))',
        )
        same(
          'viem:parseGwei',
          call('viem:parseGwei', call('viem:formatGwei', value)),
          value,
          'parseGwei(formatGwei(x))',
        )
      },
    })
    add({
      id: 'differential: parseUnits on decimal strings against ethers',
      oracle: 'differential',
      covers: ['viem:parseUnits'],
      runs: 400,
      arb: fc.record({
        sign: fc.constantFrom('', '-'),
        whole: fc.stringMatching(/^[0-9]{0,30}$/),
        fraction: fc.option(fc.stringMatching(/^[0-9]{0,45}$/), {
          nil: undefined,
        }),
        decimals,
      }),
      check({ sign, whole, fraction, decimals }) {
        const value = `${sign}${whole}${fraction === undefined ? '' : `.${fraction}`}`
        if (!/[0-9]/.test(value)) return
        let actual: bigint
        try {
          actual = fn('viem:parseUnits')(value, decimals)
        } catch (error) {
          throw crash('viem:parseUnits', error)
        }
        // Exact when the fraction fits; otherwise viem rounds half away from zero, as documented.
        const digits = (fraction ?? '').padEnd(decimals, '0')
        let expected = BigInt(`${whole || '0'}${digits.slice(0, decimals)}`)
        const rest = digits.slice(decimals)
        if (rest && Number(rest[0]) >= 5) expected += 1n
        if (sign === '-') expected = -expected
        same(
          'viem:parseUnits',
          actual,
          expected,
          `parseUnits(${JSON.stringify(value)}, ${decimals})`,
        )
        if (!rest.replace(/0/g, '') && (whole || fraction))
          same(
            'viem:parseUnits',
            actual,
            attempt(() =>
              ethers.parseUnits(
                value.replace(/\.$/, '').replace(/^(-?)\./, '$10.') || '0',
                decimals,
              ),
            ) ?? actual,
            'parseUnits against ethers',
          )
      },
    })
    add({
      id: 'consistency: parseUnits rejects what is not a decimal number',
      oracle: 'consistency',
      covers: ['viem:parseUnits', 'viem:parseEther', 'viem:parseGwei'],
      runs: 300,
      arb: fc.record({
        value: fc.oneof(
          fc.string({
            unit: fc.constantFrom(...'0123456789.-+eE x,_'),
            minLength: 1,
            maxLength: 8,
          }),
          fc.constantFrom(
            '1e18',
            '0x10',
            '1.2.3',
            '--1',
            '1-',
            '.',
            '-',
            '',
            ' 1',
            '1 ',
            'Infinity',
            'NaN',
            '1_000',
            '١',
          ),
        ),
        decimals: fc.integer({ min: 0, max: 18 }),
      }),
      check({ value, decimals }) {
        if (/^-?(\d+\.?\d*|\.\d+)$/.test(value)) return
        rejects(
          'viem:parseUnits',
          `${JSON.stringify(value)}, which is not a decimal number`,
          value,
          decimals,
        )
      },
    })
  }
  add({
    id: 'round trip: signatures, compact signatures',
    oracle: 'round trip',
    covers: [
      'viem:serializeSignature',
      'viem:hexToSignature',
      'viem:signatureToCompactSignature',
      'viem:compactSignatureToSignature',
      'viem:compactSignatureToHex',
      'viem:hexToCompactSignature',
    ],
    runs: 300,
    arb: fc.record({
      r: fc.oneof(scalar, fc.bigInt({ min: 1n, max: 2n ** 200n })),
      s: fc.oneof(
        scalar.filter((s) => s <= secp256k1N / 2n),
        fc.bigInt({ min: 1n, max: 2n ** 200n }),
      ),
      yParity: fc.integer({ min: 0, max: 1 }),
    }),
    check({ r, s, yParity }) {
      const signature = { r: toHex32(r), s: toHex32(s), yParity }
      const hex = call('viem:serializeSignature', signature)
      same(
        'viem:serializeSignature',
        hex.length,
        132,
        'serialized signature is 65 bytes',
      )
      vote(
        'viem:serializeSignature',
        {
          viem: hex,
          ox: attempt(() => ox('Signature').toHex({ r, s, yParity })),
        },
        'serializeSignature',
      )
      const parsed = call('viem:hexToSignature', hex)
      same(
        'viem:hexToSignature',
        [BigInt(parsed.r), BigInt(parsed.s), parsed.yParity],
        [r, s, yParity],
        'parseSignature(serializeSignature(x))',
      )
      const compact = call('viem:signatureToCompactSignature', signature)
      const back = call('viem:compactSignatureToSignature', compact)
      same(
        'viem:compactSignatureToSignature',
        [BigInt(back.r), BigInt(back.s), back.yParity],
        [r, s, yParity],
        'compactSignatureToSignature(signatureToCompactSignature(x))',
      )
      const compactHex = call('viem:compactSignatureToHex', compact)
      const reparsed = call('viem:hexToCompactSignature', compactHex)
      same(
        'viem:hexToCompactSignature',
        [BigInt(reparsed.r), BigInt(reparsed.yParityAndS)],
        [BigInt(compact.r), BigInt(compact.yParityAndS)],
        'parseCompactSignature(serializeCompactSignature(x))',
      )
      same(
        'viem:compactSignatureToHex',
        compactHex,
        ethers.Signature.from({ r: signature.r, s: signature.s, yParity })
          .compactSerialized,
        'compact signature against ethers',
      )
    },
  })
  add({
    id: 'consistency: high-s signatures cannot become compact silently',
    oracle: 'consistency',
    covers: ['viem:signatureToCompactSignature'],
    runs: 100,
    arb: fc.record({
      s: fc.bigInt({ min: 2n ** 255n, max: secp256k1N - 1n }),
      r: scalar,
      yParity: fc.integer({ min: 0, max: 1 }),
    }),
    check({ r, s, yParity }) {
      // EIP-2098 needs s < 2^255; above that, yParity cannot be packed into the top bit.
      const signature = { r: toHex32(r), s: toHex32(s), yParity }
      let compact: Any
      try {
        compact = fn('viem:signatureToCompactSignature')(signature)
      } catch (error) {
        if (documented(error)) return
        throw crash('viem:signatureToCompactSignature', error)
      }
      const back = call('viem:compactSignatureToSignature', compact)
      if (BigInt(back.s) !== s || back.yParity !== yParity)
        throw new Failure(
          `signatureToCompactSignature(${show(signature)}) returned ${show(compact)}, which decodes to s=${back.s}, yParity=${back.yParity}`,
          { blame: ['viem:signatureToCompactSignature'], kind: 'wrong output' },
        )
    },
  })
  add({
    id: 'round trip: ERC-6492 signatures',
    oracle: 'round trip',
    covers: [
      'viem:serializeErc6492Signature',
      'viem:parseErc6492Signature',
      'viem:isErc6492Signature',
    ],
    runs: 150,
    arb: fc.record({ address, data: hexOf(0, 80), signature: hexOf(0, 80) }),
    check(input) {
      const serialized = call('viem:serializeErc6492Signature', input)
      same(
        'viem:isErc6492Signature',
        call('viem:isErc6492Signature', serialized),
        true,
        'isErc6492Signature(serialize(x))',
      )
      const parsed = call('viem:parseErc6492Signature', serialized)
      same(
        'viem:parseErc6492Signature',
        canonical([parsed.address, parsed.data, parsed.signature]),
        canonical([input.address, input.data, input.signature]),
        'parseErc6492Signature(serialize(x))',
      )
      same(
        'viem:isErc6492Signature',
        call('viem:isErc6492Signature', input.signature),
        input.signature
          .toLowerCase()
          .endsWith(
            '6492649264926492649264926492649264926492649264926492649264926492',
          ),
        'isErc6492Signature of a plain signature',
      )
    },
  })
  add({
    id: 'differential: sign and recover against ethers',
    oracle: 'differential',
    covers: [
      'viem/accounts:sign',
      'viem:recoverAddress',
      'viem:recoverPublicKey',
      'viem/accounts:signMessage',
      'viem:recoverMessageAddress',
      'viem:verifyMessage',
    ],
    runs: 40,
    async: true,
    arb: fc.record({ key: privateKey, hash, message: text }),
    async check({ key, hash, message }) {
      const wallet = new ethers.Wallet(key)
      const expected = wallet.signingKey.sign(hash)
      const signature = await callAsync('viem/accounts:sign', {
        hash,
        privateKey: key,
      })
      same(
        'viem/accounts:sign',
        [signature.r, signature.s, signature.yParity],
        [expected.r, expected.s, expected.yParity],
        'sign is deterministic (RFC 6979) like ethers',
      )
      const hex = await callAsync('viem/accounts:sign', {
        hash,
        privateKey: key,
        to: 'hex',
      })
      same(
        'viem:recoverAddress',
        await callAsync('viem:recoverAddress', { hash, signature: hex }),
        wallet.address,
        'recoverAddress(sign(h))',
      )
      same(
        'viem:recoverPublicKey',
        await callAsync('viem:recoverPublicKey', { hash, signature: hex }),
        wallet.signingKey.publicKey,
        'recoverPublicKey(sign(h))',
      )
      const signed = await callAsync('viem/accounts:signMessage', {
        message,
        privateKey: key,
      })
      same(
        'viem/accounts:signMessage',
        signed,
        wallet.signMessageSync(message),
        'signMessage against ethers',
      )
      same(
        'viem:recoverMessageAddress',
        await callAsync('viem:recoverMessageAddress', {
          message,
          signature: signed,
        }),
        wallet.address,
        'recoverMessageAddress',
      )
      same(
        'viem:verifyMessage',
        await callAsync('viem:verifyMessage', {
          address: wallet.address,
          message,
          signature: signed,
        }),
        true,
        'verifyMessage',
      )
    },
  })
  add({
    id: 'differential: signTypedData and recover against ethers',
    oracle: 'differential',
    covers: [
      'viem/accounts:signTypedData',
      'viem:recoverTypedDataAddress',
      'viem:verifyTypedData',
    ],
    runs: 25,
    async: true,
    arb: fc.record({ key: privateKey, value: uint(256), to: address }),
    async check({ key, value, to }) {
      const domain = {
        name: 'Fuzz',
        version: '1',
        chainId: 1,
        verifyingContract: to,
      }
      const types = {
        Mail: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
        ],
      }
      const message = { to, value }
      const wallet = new ethers.Wallet(key)
      const signature = await callAsync('viem/accounts:signTypedData', {
        privateKey: key,
        domain,
        types,
        primaryType: 'Mail',
        message,
      })
      same(
        'viem/accounts:signTypedData',
        signature,
        await wallet.signTypedData(domain, types, message),
        'signTypedData against ethers',
      )
      same(
        'viem:recoverTypedDataAddress',
        await callAsync('viem:recoverTypedDataAddress', {
          domain,
          types,
          primaryType: 'Mail',
          message,
          signature,
        }),
        wallet.address,
        'recoverTypedDataAddress',
      )
      same(
        'viem:verifyTypedData',
        await callAsync('viem:verifyTypedData', {
          address: wallet.address,
          domain,
          types,
          primaryType: 'Mail',
          message,
          signature,
        }),
        true,
        'verifyTypedData',
      )
    },
  })
  add({
    id: 'differential: authorizations against ethers',
    oracle: 'differential',
    covers: [
      'viem/experimental:hashAuthorization',
      'viem/accounts:signAuthorization',
      'viem/experimental:recoverAuthorizationAddress',
      'viem/experimental:verifyAuthorization',
      'viem/experimental:serializeAuthorizationList',
    ],
    runs: 40,
    async: true,
    arb: fc.record({
      key: privateKey,
      address,
      chainId: fc.oneof(
        fc.constantFrom(0, 1),
        fc.integer({ min: 0, max: 2 ** 48 }),
      ),
      nonce: fc.oneof(
        fc.constantFrom(0, 1, 127, 128),
        fc.integer({ min: 0, max: 2 ** 48 }),
      ),
    }),
    async check({ key, address, chainId, nonce }) {
      const authorization = { address, chainId, nonce }
      same(
        'viem/experimental:hashAuthorization',
        call('viem/experimental:hashAuthorization', authorization),
        ethers.hashAuthorization(authorization),
        'hashAuthorization',
      )
      const signed = await callAsync('viem/accounts:signAuthorization', {
        ...authorization,
        privateKey: key,
      })
      const wallet = new ethers.Wallet(key)
      same(
        'viem/experimental:recoverAuthorizationAddress',
        await callAsync('viem/experimental:recoverAuthorizationAddress', {
          authorization: signed,
        }),
        wallet.address,
        'recoverAuthorizationAddress(signAuthorization(a))',
      )
      same(
        'viem/experimental:verifyAuthorization',
        await callAsync('viem/experimental:verifyAuthorization', {
          address: wallet.address,
          authorization: signed,
        }),
        true,
        'verifyAuthorization',
      )
      const list = call('viem/experimental:serializeAuthorizationList', [
        signed,
      ])
      same(
        'viem/experimental:serializeAuthorizationList',
        list.length,
        1,
        'serializeAuthorizationList keeps one tuple',
      )
    },
  })

  // Transactions.
  {
    const base = {
      chainId: fc.oneof(
        fc.constantFrom(1, 10, 8453, 2 ** 31),
        fc.integer({ min: 1, max: 2 ** 40 }),
      ),
      nonce: fc.oneof(
        fc.constantFrom(0, 1, 127, 128, 255, 256),
        fc.integer({ min: 0, max: 2 ** 40 }),
      ),
      gas: fc.option(quantity, { nil: undefined }),
      to: fc.option(address, { nil: undefined }),
      value: fc.option(quantity, { nil: undefined }),
      data: fc.option(hexOf(0, 40), { nil: undefined }),
    }
    const fees = {
      maxFeePerGas: fc.option(quantity, { nil: undefined }),
      maxPriorityFeePerGas: fc.option(quantity, { nil: undefined }),
    }
    const authorizationList = fc.array(
      fc.record({
        address,
        chainId: fc.integer({ min: 0, max: 2 ** 40 }),
        nonce: fc.integer({ min: 0, max: 2 ** 40 }),
        r: scalar.map(toHex32),
        s: scalar.map(toHex32),
        yParity: fc.integer({ min: 0, max: 1 }),
      }),
      { minLength: 1, maxLength: 2 },
    )
    const transaction = fc.oneof(
      fc.record(
        {
          type: fc.constant('legacy'),
          ...base,
          gasPrice: fc.option(quantity, { nil: undefined }),
        },
        { requiredKeys: ['type', 'chainId'] },
      ),
      fc.record(
        {
          type: fc.constant('eip2930'),
          ...base,
          gasPrice: fc.option(quantity, { nil: undefined }),
          accessList,
        },
        { requiredKeys: ['type', 'chainId'] },
      ),
      fc.record(
        { type: fc.constant('eip1559'), ...base, ...fees, accessList },
        { requiredKeys: ['type', 'chainId'] },
      ),
      fc.record(
        {
          type: fc.constant('eip4844'),
          ...base,
          to: address,
          ...fees,
          maxFeePerBlobGas: quantity,
          blobVersionedHashes: fc.array(
            hexOf(31, 31).map((hex) => `0x01${hex.slice(2)}`),
            { minLength: 1, maxLength: 3 },
          ),
          accessList,
        },
        {
          requiredKeys: [
            'type',
            'chainId',
            'to',
            'maxFeePerBlobGas',
            'blobVersionedHashes',
          ],
        },
      ),
      fc.record(
        {
          type: fc.constant('eip7702'),
          ...base,
          to: address,
          ...fees,
          authorizationList,
          accessList,
        },
        { requiredKeys: ['type', 'chainId', 'to', 'authorizationList'] },
      ),
    )
    const sanitize = (tx: Any) => {
      // A fee cap below the tip is invalid, as are zero-sized fields that the type requires.
      const out = { ...tx }
      if (
        out.maxFeePerGas !== undefined &&
        out.maxPriorityFeePerGas !== undefined &&
        out.maxPriorityFeePerGas > out.maxFeePerGas
      )
        out.maxPriorityFeePerGas = out.maxFeePerGas
      if (out.maxFeePerGas === undefined) delete out.maxPriorityFeePerGas
      for (const key of Object.keys(out))
        if (out[key] === undefined) delete out[key]
      return out
    }
    const signed = fc.tuple(
      transaction.map(sanitize),
      fc.option(signature, { nil: undefined }),
    )
    const comparable = (tx: Any) => {
      const out: Any = {}
      for (const [key, value] of Object.entries(tx)) {
        if (value === undefined || key === 'v' || key === 'typeHex') continue
        if (key === 'r' || key === 's') out[key] = BigInt(value as string)
        else if (typeof value === 'number' && key !== 'yParity')
          out[key] = BigInt(value)
        else out[key] = canonical(value)
      }
      if (out.data === '0x') delete out.data
      if (out.accessList?.length === 0) delete out.accessList
      for (const key of [
        'gas',
        'value',
        'nonce',
        'gasPrice',
        'maxFeePerGas',
        'maxPriorityFeePerGas',
      ] as const)
        if (out[key] === 0n) delete out[key]
      if (out.authorizationList)
        out.authorizationList = out.authorizationList.map((auth: Any) => ({
          address: auth.address,
          chainId: BigInt(auth.chainId),
          nonce: BigInt(auth.nonce),
          r: BigInt(auth.r),
          s: BigInt(auth.s),
          yParity: auth.yParity,
        }))
      return out
    }
    add({
      id: 'round trip: transactions (differential with ethers)',
      oracle: 'round trip',
      covers: [
        'viem:serializeTransaction',
        'viem:parseTransaction',
        'viem:getSerializedTransactionType',
        'viem:getTransactionType',
        'viem:serializeAccessList',
        'viem:assertTransactionEIP1559',
        'viem:assertTransactionEIP2930',
        'viem:assertTransactionLegacy',
      ],
      runs: 300,
      arb: signed,
      check([tx, sig]) {
        const serialized = call('viem:serializeTransaction', tx, sig)
        same(
          'viem:getTransactionType',
          call('viem:getTransactionType', tx),
          tx.type,
          'getTransactionType',
        )
        same(
          'viem:getSerializedTransactionType',
          call('viem:getSerializedTransactionType', serialized),
          tx.type,
          'getSerializedTransactionType',
        )
        const parsed = call('viem:parseTransaction', serialized)
        const expected = comparable({
          ...tx,
          ...(sig ? { r: sig.r, s: sig.s, yParity: sig.yParity } : {}),
        })
        const actual = comparable(parsed)
        if (tx.type === 'legacy' && sig) {
          delete expected.yParity
          delete actual.yParity
        }
        same(
          'viem:parseTransaction',
          actual,
          expected,
          'parseTransaction(serializeTransaction(tx))',
        )
        if (tx.type !== 'eip4844' && tx.type !== 'legacy') {
          const reference = attempt(() => {
            const etx = ethers.Transaction.from({
              ...tx,
              type: { eip2930: 1, eip1559: 2, eip7702: 4 }[tx.type as string],
              ...(tx.authorizationList
                ? {
                    authorizationList: tx.authorizationList.map(
                      (auth: Any) => ({
                        ...auth,
                        signature: {
                          r: auth.r,
                          s: auth.s,
                          yParity: auth.yParity,
                        },
                      }),
                    ),
                  }
                : {}),
              ...(sig
                ? { signature: { r: sig.r, s: sig.s, yParity: sig.yParity } }
                : {}),
            })
            return sig ? etx.serialized : etx.unsignedSerialized
          })
          if (reference !== undefined)
            same(
              'viem:serializeTransaction',
              serialized,
              reference,
              `serialized ${tx.type} against ethers`,
            )
        }
      },
    })
    add({
      id: 'round trip: recoverTransactionAddress(signTransaction(tx))',
      oracle: 'round trip',
      covers: [
        'viem/accounts:signTransaction',
        'viem:recoverTransactionAddress',
      ],
      runs: 40,
      async: true,
      arb: fc.tuple(transaction.map(sanitize), privateKey),
      async check([tx, key]) {
        const serialized = await callAsync('viem/accounts:signTransaction', {
          privateKey: key,
          transaction: tx,
        })
        const address = new ethers.Wallet(key).address
        same(
          'viem:recoverTransactionAddress',
          await callAsync('viem:recoverTransactionAddress', {
            serializedTransaction: serialized,
          }),
          address,
          'recoverTransactionAddress(signTransaction(tx))',
        )
      },
    })
    add({
      id: 'differential: parseTransaction of malformed data',
      oracle: 'crash',
      covers: ['viem:parseTransaction', 'viem:getSerializedTransactionType'],
      runs: 300,
      arb: fc
        .tuple(
          signed,
          fc.nat(),
          fc.integer({ min: 0, max: 3 }),
          fc.uint8Array({ minLength: 1, maxLength: 4 }),
        )
        .map(([[tx, sig], at, how, junk]) => {
          // The round trip property judges serialization; here an unsigned one stands in when it throws.
          const serialized =
            attempt(() => fn('viem:serializeTransaction')(tx, sig)) ??
            fn('viem:serializeTransaction')(tx)
          const bytes = [...hexBytes(serialized)]
          const index = at % bytes.length
          if (how === 0) bytes.length = Math.max(1, index)
          else if (how === 1) bytes[index] = junk[0]!
          else if (how === 2) bytes.push(...junk)
          else bytes.splice(index, 0, ...junk)
          return toHex(Uint8Array.from(bytes))
        }),
      check(hex) {
        try {
          fn('viem:parseTransaction')(hex)
        } catch (error) {
          if (!documented(error)) throw crash('viem:parseTransaction', error)
        }
      },
    })
  }
  add({
    id: 'round trip: OP Stack deposit transactions',
    oracle: 'round trip',
    covers: [
      'viem/op-stack:serializeTransaction',
      'viem/op-stack:parseTransaction',
    ],
    runs: 200,
    arb: fc.record(
      {
        type: fc.constant('deposit'),
        sourceHash: hash,
        from: address,
        to: fc.option(address, { nil: undefined }),
        mint: fc.option(quantity, { nil: undefined }),
        value: fc.option(quantity, { nil: undefined }),
        gas: quantity,
        isSystemTx: fc.option(fc.boolean(), { nil: undefined }),
        data: fc.option(hexOf(0, 40), { nil: undefined }),
      },
      { requiredKeys: ['type', 'sourceHash', 'from', 'gas'] },
    ),
    check(tx) {
      const serialized = call('viem/op-stack:serializeTransaction', tx)
      const parsed = call('viem/op-stack:parseTransaction', serialized)
      const view = (t: Any) => ({
        sourceHash: t.sourceHash,
        from: t.from?.toLowerCase(),
        to: t.to?.toLowerCase(),
        mint: t.mint || undefined,
        value: t.value || undefined,
        gas: t.gas || undefined,
        isSystemTx: t.isSystemTx || undefined,
        data: t.data && t.data !== '0x' ? t.data : undefined,
      })
      same(
        'viem/op-stack:parseTransaction',
        view(parsed),
        view(tx),
        'parseTransaction(serializeTransaction(deposit))',
      )
    },
  })
  add({
    id: 'round trip: Celo CIP-64 transactions',
    oracle: 'round trip',
    covers: ['viem/celo:serializeTransaction', 'viem/celo:parseTransaction'],
    runs: 200,
    arb: fc.tuple(
      fc
        .record(
          {
            type: fc.constant('cip64'),
            chainId: fc.integer({ min: 1, max: 2 ** 40 }),
            nonce: fc.integer({ min: 0, max: 2 ** 40 }),
            gas: fc.option(quantity, { nil: undefined }),
            to: fc.option(address, { nil: undefined }),
            value: fc.option(quantity, { nil: undefined }),
            data: fc.option(hexOf(0, 40), { nil: undefined }),
            maxFeePerGas: quantity,
            maxPriorityFeePerGas: quantity,
            feeCurrency: address,
            accessList,
          },
          {
            requiredKeys: [
              'type',
              'chainId',
              'feeCurrency',
              'maxFeePerGas',
              'maxPriorityFeePerGas',
            ],
          },
        )
        .map((tx) => ({
          ...tx,
          maxPriorityFeePerGas:
            tx.maxPriorityFeePerGas > tx.maxFeePerGas
              ? tx.maxFeePerGas
              : tx.maxPriorityFeePerGas,
        })),
      fc.option(signature, { nil: undefined }),
    ),
    check([tx, sig]) {
      const serialized = call('viem/celo:serializeTransaction', tx, sig)
      const parsed = call('viem/celo:parseTransaction', serialized)
      const view = (t: Any) => ({
        type: t.type,
        chainId: t.chainId,
        nonce: t.nonce || undefined,
        gas: t.gas || undefined,
        to: t.to?.toLowerCase(),
        value: t.value || undefined,
        data: t.data && t.data !== '0x' ? t.data : undefined,
        maxFeePerGas: t.maxFeePerGas || undefined,
        maxPriorityFeePerGas: t.maxPriorityFeePerGas || undefined,
        feeCurrency: t.feeCurrency?.toLowerCase(),
        accessList: t.accessList?.length ? canonical(t.accessList) : undefined,
        r: t.r === undefined ? undefined : BigInt(t.r),
        s: t.s === undefined ? undefined : BigInt(t.s),
        yParity: t.r === undefined ? undefined : t.yParity,
      })
      same(
        'viem/celo:parseTransaction',
        view(parsed),
        view({ ...tx, ...sig }),
        'parseTransaction(serializeTransaction(cip64))',
      )
    },
  })
  add({
    id: 'round trip: zkSync EIP-712 transactions',
    oracle: 'round trip',
    covers: [
      'viem/zksync:serializeTransaction',
      'viem/zksync:parseEip712Transaction',
    ],
    runs: 200,
    arb: fc
      .record(
        {
          type: fc.constant('eip712'),
          chainId: fc.integer({ min: 1, max: 2 ** 40 }),
          nonce: fc.integer({ min: 0, max: 2 ** 40 }),
          gas: quantity,
          to: address,
          from: address,
          value: fc.option(quantity, { nil: undefined }),
          data: fc.option(hexOf(0, 40), { nil: undefined }),
          maxFeePerGas: quantity,
          maxPriorityFeePerGas: quantity,
          gasPerPubdata: fc.option(quantity, { nil: undefined }),
          factoryDeps: fc.option(fc.array(hexOf(32, 32), { maxLength: 2 }), {
            nil: undefined,
          }),
          customSignature: fc.option(hexOf(1, 65), { nil: undefined }),
          paymaster: fc.option(address, { nil: undefined }),
          paymasterInput: fc.option(hexOf(1, 40), { nil: undefined }),
        },
        {
          requiredKeys: [
            'type',
            'chainId',
            'nonce',
            'gas',
            'to',
            'from',
            'maxFeePerGas',
            'maxPriorityFeePerGas',
          ],
        },
      )
      .map((tx) => {
        const out: Any = { ...tx }
        if (
          (out.paymaster === undefined) !==
          (out.paymasterInput === undefined)
        ) {
          delete out.paymaster
          delete out.paymasterInput
        }
        for (const key of Object.keys(out))
          if (out[key] === undefined) delete out[key]
        return out
      }),
    check(tx) {
      const serialized = call('viem/zksync:serializeTransaction', tx)
      const parsed = call('viem/zksync:parseEip712Transaction', serialized)
      const view = (t: Any) => ({
        chainId: t.chainId,
        nonce: t.nonce || undefined,
        gas: t.gas || undefined,
        to: t.to?.toLowerCase(),
        from: t.from?.toLowerCase(),
        value: t.value || undefined,
        data: t.data && t.data !== '0x' ? t.data : undefined,
        maxFeePerGas: t.maxFeePerGas || undefined,
        maxPriorityFeePerGas: t.maxPriorityFeePerGas || undefined,
        // The serializer writes the default, 50000, when none is given.
        gasPerPubdata:
          t.gasPerPubdata && t.gasPerPubdata !== 50000n
            ? t.gasPerPubdata
            : undefined,
        factoryDeps: t.factoryDeps?.length ? t.factoryDeps : undefined,
        customSignature:
          t.customSignature && t.customSignature !== '0x'
            ? t.customSignature
            : undefined,
        paymaster: t.paymaster?.toLowerCase(),
        paymasterInput:
          t.paymasterInput && t.paymasterInput !== '0x'
            ? t.paymasterInput
            : undefined,
      })
      same(
        'viem/zksync:parseEip712Transaction',
        view(parsed),
        view(tx),
        'parseEip712Transaction(serializeTransaction(eip712))',
      )
    },
  })
  add({
    id: 'round trip: Tempo transactions',
    oracle: 'round trip',
    covers: [
      'viem/tempo:Transaction.serialize',
      'viem/tempo:Transaction.deserialize',
      'viem/tempo:Account.z_TxEnvelopeTempo.serialize',
      'viem/tempo:Account.z_TxEnvelopeTempo.deserialize',
      'viem/tempo:Account.z_TxEnvelopeTempo.from',
      'viem/tempo:Transaction.isTempo',
      'viem/tempo:Transaction.getType',
    ],
    runs: 200,
    async: true,
    arb: fc.tuple(
      fc.record(
        {
          chainId: fc.integer({ min: 1, max: 2 ** 40 }),
          nonce: fc.oneof(fc.constantFrom(0n, 1n), uint(64)),
          nonceKey: fc.option(fc.oneof(fc.constantFrom(0n, 1n), uint(256)), {
            nil: undefined,
          }),
          gas: quantity,
          maxFeePerGas: quantity,
          maxPriorityFeePerGas: quantity,
          calls: fc.array(
            fc.record(
              {
                to: address,
                value: fc.option(quantity, { nil: undefined }),
                data: fc.option(hexOf(0, 40), { nil: undefined }),
              },
              { requiredKeys: ['to'] },
            ),
            { minLength: 1, maxLength: 3 },
          ),
          feeToken: fc.option(address, { nil: undefined }),
          validBefore: fc.option(fc.integer({ min: 1, max: 2 ** 40 }), {
            nil: undefined,
          }),
          validAfter: fc.option(fc.integer({ min: 1, max: 2 ** 40 }), {
            nil: undefined,
          }),
          accessList,
        },
        {
          requiredKeys: [
            'chainId',
            'nonce',
            'gas',
            'maxFeePerGas',
            'maxPriorityFeePerGas',
            'calls',
          ],
        },
      ),
      fc.option(signature, { nil: undefined }),
    ),
    async check([tx, sig]) {
      const envelope: Any = {
        ...tx,
        type: 'tempo' as const,
        maxPriorityFeePerGas:
          tx.maxPriorityFeePerGas > tx.maxFeePerGas
            ? tx.maxFeePerGas
            : tx.maxPriorityFeePerGas,
      }
      // A validity window must be open: validBefore > validAfter (a documented error otherwise).
      if (
        envelope.validBefore !== undefined &&
        envelope.validAfter !== undefined &&
        envelope.validBefore <= envelope.validAfter
      )
        envelope.validBefore = envelope.validAfter + 1
      for (const key of Object.keys(envelope))
        if (envelope[key] === undefined) delete envelope[key]
      const serialized = await callAsync(
        'viem/tempo:Transaction.serialize',
        envelope,
        sig,
      )
      same(
        'viem/tempo:Transaction.isTempo',
        call('viem/tempo:Transaction.isTempo', envelope),
        true,
        'isTempo(tx)',
      )
      const parsed = call('viem/tempo:Transaction.deserialize', serialized)
      const view = (t: Any) => ({
        chainId: t.chainId,
        nonce: BigInt(t.nonce ?? 0),
        nonceKey: t.nonceKey ? BigInt(t.nonceKey) : undefined,
        gas: t.gas || undefined,
        maxFeePerGas: t.maxFeePerGas || undefined,
        maxPriorityFeePerGas: t.maxPriorityFeePerGas || undefined,
        calls: t.calls.map((c: Any) => ({
          to: c.to?.toLowerCase(),
          value: c.value || undefined,
          data: c.data && c.data !== '0x' ? c.data : undefined,
        })),
        feeToken: t.feeToken?.toLowerCase(),
        validBefore: t.validBefore || undefined,
        validAfter: t.validAfter || undefined,
        accessList: t.accessList?.length ? canonical(t.accessList) : undefined,
      })
      same(
        'viem/tempo:Transaction.deserialize',
        view(parsed),
        view(envelope),
        'deserialize(serialize(tempo tx))',
      )
      const oxSerialized = call(
        'viem/tempo:Account.z_TxEnvelopeTempo.serialize',
        call('viem/tempo:Account.z_TxEnvelopeTempo.from', envelope),
      )
      const oxParsed = call(
        'viem/tempo:Account.z_TxEnvelopeTempo.deserialize',
        oxSerialized,
      )
      same(
        'viem/tempo:Account.z_TxEnvelopeTempo.deserialize',
        view(oxParsed),
        view(envelope),
        'TxEnvelopeTempo deserialize(serialize(tx))',
      )
    },
  })
  add({
    id: 'round trip: toBlobs ↔ fromBlobs',
    oracle: 'round trip',
    covers: ['viem:toBlobs', 'viem:fromBlobs'],
    runs: 40,
    arb: fc.oneof(
      bytesOf(1, 300),
      fc
        .tuple(
          bytesOf(0, 64),
          fc.constantFrom(0x80, 0x00, 0x80, 0xff),
          fc.integer({ min: 1, max: 40 }),
        )
        .map(([head, byte, count]) =>
          Uint8Array.from([...head, ...new Array(count).fill(byte)]),
        ),
      fc
        .integer({ min: 1, max: 4 })
        .map((n) => new Uint8Array(31 * 4096 - n).fill(0x80)),
    ),
    check(bytes) {
      const hex = toHex(bytes)
      const blobs = call('viem:toBlobs', { data: hex })
      same(
        'viem:fromBlobs',
        call('viem:fromBlobs', { blobs }),
        hex,
        'fromBlobs(toBlobs(data))',
      )
      const blobBytes = call('viem:toBlobs', { data: bytes, to: 'bytes' })
      same(
        'viem:fromBlobs',
        call('viem:fromBlobs', { blobs: blobBytes, to: 'bytes' }),
        bytes,
        'fromBlobs(toBlobs(bytes))',
      )
    },
  })
  add({
    id: 'differential: versioned hashes against ox',
    oracle: 'differential',
    covers: [
      'viem:commitmentToVersionedHash',
      'viem:commitmentsToVersionedHashes',
    ],
    runs: 100,
    arb: fc.array(hexOf(48, 48), { minLength: 1, maxLength: 3 }),
    check(commitments) {
      const hashes = call('viem:commitmentsToVersionedHashes', { commitments })
      same(
        'viem:commitmentsToVersionedHashes',
        hashes,
        ox('Blobs').commitmentsToVersionedHashes(commitments),
        'commitmentsToVersionedHashes against ox',
      )
      same(
        'viem:commitmentToVersionedHash',
        call('viem:commitmentToVersionedHash', { commitment: commitments[0] }),
        `0x01${ethers.sha256(commitments[0]).slice(4)}`,
        'commitmentToVersionedHash',
      )
    },
  })

  // Sign-In with Ethereum.
  {
    const siwe = fc.record(
      {
        domain: fc.oneof(
          fc.stringMatching(/^[a-z0-9]{1,10}(\.[a-z]{2,5}){1,2}$/),
          fc.stringMatching(/^[a-z]{1,8}\.[a-z]{2,4}:[1-9][0-9]{0,4}$/),
        ),
        address: address.map((value) => ethers.getAddress(value)),
        statement: fc.option(
          fc.string({
            unit: fc.constantFrom(..."abc XYZ012.,!?:'/-_"),
            minLength: 1,
            maxLength: 40,
          }),
          { nil: undefined },
        ),
        uri: fc.oneof(
          fc.webUrl(),
          fc.constantFrom(
            'https://example.com',
            'did:key:z6Mk',
            'urn:uuid:1',
            'ipfs://bafy/x?y=1#z',
          ),
        ),
        version: fc.constant('1' as const),
        chainId: fc.integer({ min: 1, max: 2 ** 40 }),
        nonce: fc.stringMatching(/^[a-zA-Z0-9]{8,24}$/),
        issuedAt: fc.option(
          fc.date({
            min: new Date(0),
            max: new Date('2100-01-01'),
            noInvalidDate: true,
          }),
          { nil: undefined },
        ),
        expirationTime: fc.option(
          fc.date({
            min: new Date(0),
            max: new Date('2100-01-01'),
            noInvalidDate: true,
          }),
          { nil: undefined },
        ),
        notBefore: fc.option(
          fc.date({
            min: new Date(0),
            max: new Date('2100-01-01'),
            noInvalidDate: true,
          }),
          { nil: undefined },
        ),
        requestId: fc.option(fc.stringMatching(/^[a-zA-Z0-9-]{1,20}$/), {
          nil: undefined,
        }),
        resources: fc.option(
          fc.array(
            fc.oneof(
              fc.webUrl(),
              fc.constant(
                'ipfs://bafybeiemxf5abjwjbikoz4mc3a3dla6ual3jsgpdr4cjr3oz3evfyavhwq/',
              ),
            ),
            { minLength: 1, maxLength: 3 },
          ),
          { nil: undefined },
        ),
        scheme: fc.option(fc.constantFrom('https', 'http'), { nil: undefined }),
      },
      {
        requiredKeys: [
          'domain',
          'address',
          'uri',
          'version',
          'chainId',
          'nonce',
        ],
      },
    )
    add({
      id: 'round trip: SIWE messages',
      oracle: 'round trip',
      covers: [
        'viem/siwe:createSiweMessage',
        'viem/siwe:parseSiweMessage',
        'viem/siwe:validateSiweMessage',
      ],
      runs: 300,
      arb: siwe,
      check(input) {
        const fields = { ...input }
        for (const key of Object.keys(fields))
          if ((fields as Any)[key] === undefined) delete (fields as Any)[key]
        const message = call('viem/siwe:createSiweMessage', fields)
        const parsed = call('viem/siwe:parseSiweMessage', message)
        const view = (m: Any) => ({
          ...m,
          issuedAt: m.issuedAt?.toISOString?.() ?? m.issuedAt,
          expirationTime: m.expirationTime?.toISOString?.() ?? m.expirationTime,
          notBefore: m.notBefore?.toISOString?.() ?? m.notBefore,
        })
        const expected = view(fields)
        // createSiweMessage defaults issuedAt to now; compare only what the input fixed.
        const actual = view(parsed)
        if (expected.issuedAt === undefined) delete actual.issuedAt
        same(
          'viem/siwe:parseSiweMessage',
          actual,
          expected,
          'parseSiweMessage(createSiweMessage(x))',
        )
        const time = new Date('2050-01-01')
        const valid = call('viem/siwe:validateSiweMessage', {
          message: parsed,
          time,
        })
        const expectedValid =
          (fields.expirationTime === undefined ||
            time < fields.expirationTime) &&
          (fields.notBefore === undefined || time >= fields.notBefore)
        same(
          'viem/siwe:validateSiweMessage',
          valid,
          expectedValid,
          'validateSiweMessage time window',
        )
      },
    })
    add({
      id: 'differential: SIWE parsing against ox',
      oracle: 'differential',
      covers: ['viem/siwe:parseSiweMessage'],
      runs: 200,
      arb: siwe.chain((input) =>
        fc.tuple(
          fc.constant(input),
          fc.nat(),
          fc.constantFrom('\n', ':', ' ', '', 'x', '\r'),
        ),
      ),
      check([input, at, junk]) {
        const fields = { ...input }
        for (const key of Object.keys(fields))
          if ((fields as Any)[key] === undefined) delete (fields as Any)[key]
        const message: string = fn('viem/siwe:createSiweMessage')(fields)
        const index = at % message.length
        const mutated =
          message.slice(0, index) + junk + message.slice(index + 1)
        let actual: Any
        try {
          actual = fn('viem/siwe:parseSiweMessage')(mutated)
        } catch (error) {
          throw crash('viem/siwe:parseSiweMessage', error)
        }
        const expected = attempt(() => ox('Siwe').parseMessage(mutated))
        if (expected === undefined) return
        // viem parses each field on its own and returns a partial message by design; ox needs the
        // whole grammar. Fields both return must agree.
        const view = (value: unknown) =>
          JSON.stringify(value, (_, item) =>
            item instanceof Date ? item.toISOString() : item,
          )
        // viem returns an Invalid Date for a date-time that is not RFC 3339, on purpose.
        for (const key of Object.keys(expected))
          if (
            key in actual &&
            !(
              actual[key] instanceof Date && Number.isNaN(actual[key].getTime())
            )
          )
            same(
              'viem/siwe:parseSiweMessage',
              view(actual[key]),
              view(expected[key]),
              `parseSiweMessage(…).${key} of ${JSON.stringify(mutated.slice(Math.max(0, index - 20), index + 20))}`,
            )
      },
    })
  }

  // User operations.
  {
    const userOperation = fc.oneof(
      fc
        .record({
          sender: address,
          nonce: uint(256),
          callData: hexOf(0, 40),
          callGasLimit: uint(128),
          verificationGasLimit: uint(128),
          preVerificationGas: uint(128),
          maxFeePerGas: uint(128),
          maxPriorityFeePerGas: uint(128),
          signature: hexOf(0, 65),
          initCode: hexOf(0, 40),
          paymasterAndData: hexOf(0, 40),
        })
        .map((op) => ({ op, version: '0.6' as const })),
      fc
        .record(
          {
            sender: address,
            nonce: uint(256),
            callData: hexOf(0, 40),
            callGasLimit: uint(128),
            verificationGasLimit: uint(128),
            preVerificationGas: uint(128),
            maxFeePerGas: uint(128),
            maxPriorityFeePerGas: uint(128),
            signature: hexOf(0, 65),
            factory: fc.option(address, { nil: undefined }),
            factoryData: fc.option(hexOf(0, 40), { nil: undefined }),
            paymaster: fc.option(address, { nil: undefined }),
            paymasterVerificationGasLimit: fc.option(uint(128), {
              nil: undefined,
            }),
            paymasterPostOpGasLimit: fc.option(uint(128), { nil: undefined }),
            paymasterData: fc.option(hexOf(0, 40), { nil: undefined }),
          },
          {
            requiredKeys: [
              'sender',
              'nonce',
              'callData',
              'callGasLimit',
              'verificationGasLimit',
              'preVerificationGas',
              'maxFeePerGas',
              'maxPriorityFeePerGas',
              'signature',
            ],
          },
        )
        .map((op) => {
          const out: Any = { ...op }
          if (!out.factory) delete out.factoryData
          if (!out.paymaster) {
            delete out.paymasterData
            delete out.paymasterVerificationGasLimit
            delete out.paymasterPostOpGasLimit
          } else {
            out.paymasterVerificationGasLimit ??= 0n
            out.paymasterPostOpGasLimit ??= 0n
            out.paymasterData ??= '0x'
          }
          if (out.factory) out.factoryData ??= '0x'
          for (const key of Object.keys(out))
            if (out[key] === undefined) delete out[key]
          return { op: out, version: '0.7' as const }
        }),
    )
    add({
      id: 'round trip: user operations to and from RPC (and ox hash)',
      oracle: 'round trip',
      covers: [
        'viem/account-abstraction:formatUserOperationRequest',
        'viem/account-abstraction:formatUserOperation',
        'viem/account-abstraction:getUserOperationHash',
        'viem/account-abstraction:toPackedUserOperation',
        'viem/account-abstraction:getInitCode',
      ],
      runs: 200,
      arb: fc.tuple(
        userOperation,
        address,
        fc.integer({ min: 1, max: 2 ** 40 }),
      ),
      check([{ op, version }, entryPointAddress, chainId]) {
        const rpc = call(
          'viem/account-abstraction:formatUserOperationRequest',
          op,
        )
        const back = call('viem/account-abstraction:formatUserOperation', rpc)
        same(
          'viem/account-abstraction:formatUserOperation',
          canonical(back),
          canonical(op),
          'formatUserOperation(formatUserOperationRequest(op))',
        )
        const hash = call('viem/account-abstraction:getUserOperationHash', {
          userOperation: op,
          entryPointAddress,
          entryPointVersion: version,
          chainId,
        })
        const reference = attempt(() =>
          ox('erc4337/UserOperation').hash(op, {
            chainId,
            entryPointAddress,
            entryPointVersion: version,
          }),
        )
        vote(
          'viem/account-abstraction:getUserOperationHash',
          { viem: hash, ox: reference },
          `getUserOperationHash (EntryPoint ${version})`,
        )
        if (version === '0.7') {
          const packed = call(
            'viem/account-abstraction:toPackedUserOperation',
            op,
          )
          vote(
            'viem/account-abstraction:toPackedUserOperation',
            {
              viem: canonical(packed),
              ox: attempt(() =>
                canonical(ox('erc4337/UserOperation').toPacked(op)),
              ),
            },
            'toPackedUserOperation',
          )
        }
      },
    })
  }
  add({
    id: 'round trip: OP Stack opaque deposit data',
    oracle: 'round trip',
    covers: ['viem/op-stack:opaqueDataToDepositData'],
    runs: 150,
    arb: fc.record({
      mint: uint(256),
      value: uint(256),
      gas: uint(64),
      isCreation: fc.boolean(),
      data: hexOf(0, 60),
    }),
    check({ mint, value, gas, isCreation, data }) {
      const opaque = call(
        'viem:encodePacked',
        ['uint256', 'uint256', 'uint64', 'bool', 'bytes'],
        [mint, value, gas, isCreation, data],
      )
      const decoded = call('viem/op-stack:opaqueDataToDepositData', opaque)
      same(
        'viem/op-stack:opaqueDataToDepositData',
        canonical(decoded),
        canonical({ mint, value, gas, isCreation, data }),
        'opaqueDataToDepositData(encodePacked(x))',
      )
    },
  })
  add({
    id: 'differential: OP Stack source hashes against the spec',
    oracle: 'differential',
    covers: ['viem/op-stack:getSourceHash'],
    runs: 150,
    arb: fc.record({
      domain: fc.constantFrom('userDeposit', 'l1InfoDeposit'),
      l1BlockHash: hash,
      l1LogIndex: fc.integer({ min: 0, max: 2 ** 40 }),
      sequenceNumber: fc.integer({ min: 0, max: 2 ** 40 }),
    }),
    check({ domain, l1BlockHash, l1LogIndex, sequenceNumber }) {
      const marker = domain === 'userDeposit' ? l1LogIndex : sequenceNumber
      const depositId = ethers.keccak256(
        ethers.concat([l1BlockHash, ethers.toBeHex(marker, 32)]),
      )
      const expected = ethers.keccak256(
        ethers.concat([
          ethers.toBeHex(domain === 'userDeposit' ? 0 : 1, 32),
          depositId,
        ]),
      )
      same(
        'viem/op-stack:getSourceHash',
        call(
          'viem/op-stack:getSourceHash',
          domain === 'userDeposit'
            ? { domain, l1BlockHash, l1LogIndex }
            : { domain, l1BlockHash, sequenceNumber },
        ),
        expected,
        'getSourceHash',
      )
    },
  })
  add({
    id: 'round trip: zkSync L1→L2 alias',
    oracle: 'round trip',
    covers: ['viem/zksync:undoL1ToL2Alias'],
    runs: 200,
    arb: uint(160),
    check(value) {
      const offset = 0x1111000000000000000000000000000000001111n
      const aliased = `0x${((value + offset) % 2n ** 160n).toString(16).padStart(40, '0')}`
      same(
        'viem/zksync:undoL1ToL2Alias',
        canonical(call('viem/zksync:undoL1ToL2Alias', aliased)),
        `0x${value.toString(16).padStart(40, '0')}`,
        `undoL1ToL2Alias(alias(${aliased}))`,
      )
    },
  })
  add({
    id: 'consistency: zkSync hashBytecode',
    oracle: 'consistency',
    covers: ['viem/zksync:hashBytecode'],
    runs: 150,
    arb: fc
      .integer({ min: 0, max: 40 })
      .chain((words) =>
        fc.uint8Array({ minLength: words * 32, maxLength: words * 32 }),
      ),
    check(bytes) {
      const words = bytes.length / 32
      const valid = words > 0 && words % 2 === 1 && words < 2 ** 16
      if (!valid)
        return rejects(
          'viem/zksync:hashBytecode',
          `bytecode of ${words} words`,
          toHex(bytes),
        )
      const hash = call('viem/zksync:hashBytecode', toHex(bytes))
      const expected = `0x0100${words.toString(16).padStart(4, '0')}${ethers.sha256(bytes).slice(10)}`
      same(
        'viem/zksync:hashBytecode',
        toHex(hash instanceof Uint8Array ? hash : hexBytes(hash)),
        expected,
        `hashBytecode of ${words} words`,
      )
    },
  })
  add({
    id: 'round trip: zkSync paymaster inputs',
    oracle: 'round trip',
    covers: [
      'viem/zksync:getApprovalBasedPaymasterInput',
      'viem/zksync:getGeneralPaymasterInput',
    ],
    runs: 150,
    arb: fc.record({
      token: address,
      minAllowance: uint(256),
      innerInput: hexOf(0, 40),
    }),
    check({ token, minAllowance, innerInput }) {
      const approval = call('viem/zksync:getApprovalBasedPaymasterInput', {
        token,
        minAllowance,
        innerInput,
      })
      const abi = [
        {
          type: 'function',
          name: 'approvalBased',
          inputs: [{ type: 'address' }, { type: 'uint256' }, { type: 'bytes' }],
          outputs: [],
          stateMutability: 'nonpayable',
        },
        {
          type: 'function',
          name: 'general',
          inputs: [{ type: 'bytes' }],
          outputs: [],
          stateMutability: 'nonpayable',
        },
      ]
      const decoded = call('viem:decodeFunctionData', { abi, data: approval })
      same(
        'viem/zksync:getApprovalBasedPaymasterInput',
        canonical([decoded.functionName, ...decoded.args]),
        canonical(['approvalBased', token, minAllowance, innerInput]),
        'getApprovalBasedPaymasterInput decodes back',
      )
      const general = call('viem:decodeFunctionData', {
        abi,
        data: call('viem/zksync:getGeneralPaymasterInput', { innerInput }),
      })
      same(
        'viem/zksync:getGeneralPaymasterInput',
        canonical([general.functionName, ...general.args]),
        canonical(['general', innerInput]),
        'getGeneralPaymasterInput decodes back',
      )
    },
  })

  // Tempo utilities from ox.
  {
    add({
      id: 'round trip: Tempo addresses, token IDs, ticks',
      oracle: 'round trip',
      covers: [
        'viem/tempo:TempoAddress.format',
        'viem/tempo:TempoAddress.parse',
        'viem/tempo:TempoAddress.validate',
        'viem/tempo:TempoAddress.resolve',
        'viem/tempo:TokenId.fromAddress',
        'viem/tempo:TokenId.toAddress',
        'viem/tempo:Tick.toPrice',
        'viem/tempo:Tick.fromPrice',
      ],
      runs: 200,
      arb: fc.record({
        address,
        id: uint(64),
        tick: fc.integer({ min: -2000, max: 2000 }),
      }),
      check({ address, id, tick }) {
        const formatted = call('viem/tempo:TempoAddress.format', address)
        same(
          'viem/tempo:TempoAddress.validate',
          call('viem/tempo:TempoAddress.validate', formatted),
          true,
          'validate(format(a))',
        )
        const parsed = call('viem/tempo:TempoAddress.parse', formatted)
        same(
          'viem/tempo:TempoAddress.parse',
          canonical(parsed.address ?? parsed),
          address,
          'parse(format(a))',
        )
        const tokenAddress = call('viem/tempo:TokenId.toAddress', id)
        same(
          'viem/tempo:TokenId.fromAddress',
          call('viem/tempo:TokenId.fromAddress', tokenAddress),
          id,
          'fromAddress(toAddress(id))',
        )
        const price = call('viem/tempo:Tick.toPrice', tick)
        same(
          'viem/tempo:Tick.fromPrice',
          call('viem/tempo:Tick.fromPrice', price),
          tick,
          `fromPrice(toPrice(${tick}))`,
        )
        same(
          'viem/tempo:TempoAddress.resolve',
          canonical(call('viem/tempo:TempoAddress.resolve', formatted)),
          address,
          'resolve(format(a))',
        )
        same(
          'viem/tempo:TempoAddress.resolve',
          canonical(call('viem/tempo:TempoAddress.resolve', address)),
          address,
          'resolve(a)',
        )
      },
    })

    // Configurable account configs (TIP-1111): owners strictly ascending, weights summing to at most
    // 255, and a threshold the 8 heaviest owners can reach.
    const accountConfig = fc
      .record({
        owners: fc.uniqueArray(
          fc.tuple(address, fc.integer({ min: 1, max: 30 })),
          { minLength: 1, maxLength: 8, selector: ([owner]) => owner },
        ),
        salt: fc.option(hash, { nil: undefined }),
        version: fc.option(
          fc.oneof(fc.constantFrom(0n, 1n, 2n ** 64n - 1n), uint(64)),
          { nil: undefined },
        ),
        pick: fc.double({ min: 0, max: 1, noNaN: true }),
      })
      .filter(({ owners }) => owners.every(([owner]) => BigInt(owner) !== 0n))
      .map(({ owners, salt, version, pick }) => {
        const total = owners.reduce((sum, [, weight]) => sum + weight, 0)
        return {
          owners: owners.map(([owner, weight]) => ({ owner, weight })),
          threshold: Math.max(1, Math.ceil(pick * total)),
          ...(salt ? { salt } : {}),
          ...(version !== undefined ? { version } : {}),
        }
      })
    add({
      id: 'round trip: Tempo account configs to RPC and tuples',
      oracle: 'round trip',
      covers: [
        'viem/tempo:AccountConfig.toRpc',
        'viem/tempo:AccountConfig.fromRpc',
        'viem/tempo:AccountConfig.toTuple',
        'viem/tempo:AccountConfig.fromTuple',
        'viem/tempo:AccountConfig.assert',
        'viem/tempo:AccountConfig.validate',
        'viem/tempo:AccountConfig.getCommitment',
        'viem/tempo:AccountConfig.getAddress',
        'viem/tempo:AccountConfig.update',
        'viem/tempo:AccountConfig.from',
      ],
      runs: 150,
      arb: fc.tuple(accountConfig, accountConfig),
      check([raw, next]) {
        const config = call('viem/tempo:AccountConfig.from', raw)
        call('viem/tempo:AccountConfig.assert', config)
        same(
          'viem/tempo:AccountConfig.validate',
          call('viem/tempo:AccountConfig.validate', config),
          true,
          'validate(from(c))',
        )
        same(
          'viem/tempo:AccountConfig.fromRpc',
          canonical(
            call(
              'viem/tempo:AccountConfig.fromRpc',
              call('viem/tempo:AccountConfig.toRpc', config),
            ),
          ),
          canonical(config),
          'fromRpc(toRpc(c))',
        )
        same(
          'viem/tempo:AccountConfig.fromTuple',
          canonical(
            call(
              'viem/tempo:AccountConfig.fromTuple',
              call('viem/tempo:AccountConfig.toTuple', config),
            ),
          ),
          canonical(config),
          'fromTuple(toTuple(c))',
        )
        const commitment = call(
          'viem/tempo:AccountConfig.getCommitment',
          config,
        )
        same(
          'viem/tempo:AccountConfig.getCommitment',
          /^0x[0-9a-f]{64}$/.test(commitment),
          true,
          'getCommitment is a 32-byte hash',
        )
        if (config.version === 0n) {
          // A derived address of zero or equal to an owner is rejected (InvalidConfigError).
          let account: string | undefined
          try {
            account = fn('viem/tempo:AccountConfig.getAddress')(config)
          } catch (error) {
            if (!documented(error))
              throw crash('viem/tempo:AccountConfig.getAddress', error)
          }
          if (account)
            same(
              'viem/tempo:AccountConfig.getAddress',
              /^0x[0-9a-fA-F]{40}$/.test(account),
              true,
              'getAddress is an address',
            )
        }
        if (config.version < 2n ** 64n - 1n) {
          const updated = call('viem/tempo:AccountConfig.update', config, {
            owners: next.owners,
            threshold: next.threshold,
          })
          same(
            'viem/tempo:AccountConfig.update',
            [updated.version, updated.salt],
            [config.version + 1n, config.salt],
            'update keeps the salt and bumps the version',
          )
        }
      },
    })

    // Receive-policy receipts (TIP-1028): encode ↔ decode, and from the `TransferBlocked` log.
    add({
      id: 'round trip: Tempo receive-policy receipts',
      oracle: 'round trip',
      covers: [
        'viem/tempo:ReceivePolicyReceipt.encode',
        'viem/tempo:ReceivePolicyReceipt.decode',
        'viem/tempo:ReceivePolicyReceipt.from',
        'viem/tempo:ReceivePolicyReceipt.fromLog',
        'viem/tempo:ReceivePolicyReceipt.fromTransactionReceipt',
      ],
      runs: 150,
      arb: fc.record({
        version: fc.integer({ min: 0, max: 255 }),
        token: address,
        recoveryAuthority: address,
        originator: address,
        recipient: address,
        blockedAt: uint(64),
        blockedNonce: uint(64),
        blockedReason: fc.constantFrom('none', 'tokenFilter', 'receivePolicy'),
        kind: fc.constantFrom('transfer', 'mint'),
        memo: hash,
        amount: uint(256),
      }),
      check({ amount, ...receipt }) {
        const encoded = call('viem/tempo:ReceivePolicyReceipt.encode', receipt)
        same(
          'viem/tempo:ReceivePolicyReceipt.decode',
          canonical(call('viem/tempo:ReceivePolicyReceipt.decode', encoded)),
          canonical(receipt),
          'decode(encode(r))',
        )
        same(
          'viem/tempo:ReceivePolicyReceipt.from',
          call('viem/tempo:ReceivePolicyReceipt.from', receipt),
          encoded,
          'from(r) = encode(r)',
        )
        same(
          'viem/tempo:ReceivePolicyReceipt.from',
          call('viem/tempo:ReceivePolicyReceipt.from', encoded),
          encoded,
          'from(hex) = hex',
        )
        const event =
          'event TransferBlocked(address indexed token, address indexed receiver, uint64 indexed blockedNonce, uint256 amount, uint8 receiptVersion, bytes receipt)'
        const iface = new ethers.Interface([event])
        const log = iface.encodeEventLog('TransferBlocked', [
          receipt.token,
          receipt.recipient,
          receipt.blockedNonce,
          amount,
          receipt.version,
          encoded,
        ])
        same(
          'viem/tempo:ReceivePolicyReceipt.fromLog',
          call('viem/tempo:ReceivePolicyReceipt.fromLog', log),
          encoded,
          'fromLog(TransferBlocked log)',
        )
        const other = { topics: [`0x${'00'.repeat(32)}`], data: '0x' }
        same(
          'viem/tempo:ReceivePolicyReceipt.fromTransactionReceipt',
          call('viem/tempo:ReceivePolicyReceipt.fromTransactionReceipt', {
            logs: [other, log],
          }),
          [encoded],
          'fromTransactionReceipt picks the TransferBlocked log',
        )
      },
    })
  }

  // Action members that need no client: every `extractEvent(s)` (logs in, decoded event out) and
  // every `call(s)` (arguments in, calldata out), found by walking the action namespaces.
  {
    const tempoAbis = (lib.v['viem/tempo'] as Any).Abis
    const members: { name: string; fn: Any; key: string; source: string }[] = []
    const walk = (entry: string, prefix: string, namespace: Any) => {
      for (const [name, action] of Object.entries<Any>(namespace))
        if (typeof action === 'function')
          for (const key of ['extractEvent', 'extractEvents', 'call', 'calls'])
            if (typeof action[key] === 'function')
              members.push({
                name: `${entry}:${prefix}${name}.${key}`,
                fn: action[key],
                key,
                source: Function.prototype.toString.call(action[key]),
              })
    }
    for (const [namespace, actions] of Object.entries<Any>(
      (lib.v['viem/tempo'] as Any).Actions,
    ))
      walk('viem/tempo', `Actions.${namespace}.`, actions)
    walk('viem/actions', 'token.', (lib.v['viem/actions'] as Any).token)
    const known = new Set<unknown>()
    const unique = members.filter(({ fn }) => !known.has(fn) && known.add(fn))

    for (const member of unique.filter((member) =>
      member.key.startsWith('extract'),
    )) {
      // Some extractors also take the call's parameters and keep only the logs that match them:
      // the emitting contract (`vault`, `factory`, `engine`, `pool`) and event fields (`tradeId`).
      const params = member.source.match(/^[^(]*\(([^)]*)\)/)?.[1] ?? ''
      const takesParameters =
        params.split(',').filter((param) => param.trim()).length > 1
      const abiName = member.source.match(/abi: (?:Abis\.)?(\w+)/)?.[1]
      const eventName = member.source.match(/eventName: '(\w+)'/)?.[1]
      const abi = abiName
        ? (tempoAbis[abiName] ?? (lib.v.viem as Any)[abiName])
        : undefined
      const event = abi?.find(
        (item: Any) => item.type === 'event' && item.name === eventName,
      )
      if (!event) continue
      const inputs = event.inputs.map((input: Any, i: number) => ({
        ...input,
        name: input.name || `arg${i}`,
      }))
      // `placeFlip.extractEvent` looks for the flip order among `OrderPlaced` logs.
      const flip = /Flip/.test(member.name)
      add({
        id: `round trip: ${member.name.split(':')[1]} decodes the ${eventName} log it is given`,
        oracle: 'round trip',
        covers: [member.name],
        runs: 40,
        arb: fc.tuple(
          ...inputs.map((input: Param) =>
            flip && input.name === 'isFlipOrder'
              ? fc.constant(true)
              : arbitraryOf(input),
          ),
        ),
        check(values: unknown[]) {
          const iface = new ethers.Interface([event])
          const encoded = iface.encodeEventLog(
            event.name,
            inputs.map((input: Param, i: number) => toEthers(input, values[i])),
          )
          const log = {
            address: '0x20c0000000000000000000000000000000000001',
            data: encoded.data,
            topics: encoded.topics,
            blockHash: null,
            blockNumber: null,
            logIndex: null,
            transactionHash: null,
            transactionIndex: null,
            removed: false,
          }
          const parameters = new Proxy({} as Record<string, unknown>, {
            get(_, key) {
              if (typeof key !== 'string') return undefined
              if (/^(vault|factory|engine|pool|address|contract)$/.test(key))
                return log.address
              const i = inputs.findIndex((input: Param) => input.name === key)
              return i >= 0 ? values[i] : log.address
            },
          })
          const result = takesParameters
            ? call(member.name, [log], parameters)
            : call(member.name, [log])
          const decoded = Array.isArray(result)
            ? result.find((item: Any) => item.eventName === eventName)
            : result
          same(member.name, decoded?.eventName, eventName, 'decoded event name')
          inputs.forEach((input: Any, i: number) => {
            // An indexed dynamic value is only its hash in the topic.
            if (input.indexed && !isStatic(input)) return
            same(
              member.name,
              canonical(decoded.args[input.name]),
              canonical(values[i]),
              `args.${input.name}`,
            )
          })
        },
      })
    }

    /** Candidate values for an argument, by its name, for probing which keys a call reads. */
    const guess = (key: string): unknown[] => {
      const name = key.toLowerCase()
      const out: unknown[] = []
      // An amount by its last camel-case word: `validatorTokenAmount`, `assetAmountMin`, but not
      // `account` or `feeToken`.
      const last = key.match(/[A-Z]?[a-z0-9]+$/)?.[0].toLowerCase()
      if (
        last &&
        /^(amount|value|price|fee|supply|limit|bps|shares|deadline|expiry|nonce|index|count|rate|duration|min|max)$/.test(
          last,
        )
      )
        out.push(1n, 1)
      if (/name|symbol|currency|uri|url|description|label/.test(name))
        out.push('x')
      if (
        /token|address|^to$|from|recipient|account|owner|spender|sender|vault|pool|payee|payer|validator|admin|engine|router|factory|target|asset|operator|beneficiary|delegate|keyid|signer|contract|user|receiver|holder|manager|zone|portal|master|registry|payout|feetoken/.test(
          name,
        )
      )
        out.push(
          '0x20c0000000000000000000000000000000000001',
          '0x00000000000000000000000000000000000000a1',
        )
      if (/tick/.test(name)) out.push(10, -10)
      if (/^(type|side)$/.test(name)) out.push('buy', 'sell')
      if (/mode/.test(name)) out.push('exactInput', 'exactOutput')
      if (
        /memo|hash|salt|data|signature|proof|commitment|digest|root|channelid/.test(
          name,
        )
      )
        out.push(`0x${'11'.repeat(32)}`)
      out.push(
        1n,
        1,
        '0x00000000000000000000000000000000000000a1',
        true,
        `0x${'11'.repeat(32)}`,
        [],
        'x',
      )
      return [...new Set(out)]
    }
    /** An argument object the call accepts, found by trying candidates for each key it reads. */
    const probe = (fn: Any): Record<string, unknown> | undefined => {
      const choice = new Map<string, number>()
      for (let attempt = 0; attempt < 80; attempt++) {
        const target: Record<string, unknown> = {}
        for (const [key, index] of choice) target[key] = guess(key)[index]
        const order: string[] = []
        const proxy = new Proxy(target, {
          get(object, key) {
            if (
              typeof key === 'string' &&
              !/^(then|toJSON|constructor|__proto__|valueOf|toString)$/.test(
                key,
              )
            )
              order.push(key)
            return Reflect.get(object, key)
          },
        })
        try {
          fn(proxy)
          fn({ ...target })
          return target
        } catch {
          const fresh = [...new Set(order.filter((key) => !choice.has(key)))]
          if (fresh.length) {
            for (const key of fresh) choice.set(key, 0)
            continue
          }
          const last = order.at(-1)
          if (!last || choice.get(last)! + 1 >= guess(last).length)
            return undefined
          choice.set(last, choice.get(last)! + 1)
        }
      }
      return undefined
    }
    const like = (value: unknown): Arbitrary => {
      if (typeof value === 'bigint')
        return fc.oneof(
          fc.constantFrom(0n, 1n, 2n ** 128n - 1n, 2n ** 255n, 2n ** 256n - 1n),
          uint(256),
        )
      if (typeof value === 'number')
        return fc.oneof(
          fc.constantFrom(value, 0, -1, 1),
          fc.integer({ min: -(2 ** 20), max: 2 ** 20 }),
        )
      if (typeof value === 'boolean') return fc.boolean()
      if (typeof value === 'string' && /^0x[0-9a-f]{40}$/i.test(value))
        return fc.oneof(fc.constant(value), address)
      if (typeof value === 'string' && /^0x[0-9a-f]{64}$/i.test(value))
        return hash
      return fc.constant(value)
    }
    /**
     * The two values with every leaf whose JavaScript types differ blanked in both. A probed
     * argument can have the wrong type for its ABI slot (a hex string where a uint goes), which
     * the encoder accepts; only same-typed leaves must round trip.
     */
    const alike = (got: unknown, expected: unknown): [unknown, unknown] => {
      if (
        Array.isArray(got) &&
        Array.isArray(expected) &&
        got.length === expected.length
      ) {
        const pairs = got.map((item, i) => alike(item, expected[i]))
        return [pairs.map(([a]) => a), pairs.map(([, b]) => b)]
      }
      const plain = (value: unknown) =>
        !!value &&
        typeof value === 'object' &&
        Object.getPrototypeOf(value) === Object.prototype
      if (plain(got) && plain(expected)) {
        const out: [Record<string, unknown>, Record<string, unknown>] = [{}, {}]
        for (const key of new Set([
          ...Object.keys(got as object),
          ...Object.keys(expected as object),
        ]))
          [out[0][key], out[1][key]] = alike(
            (got as Any)[key],
            (expected as Any)[key],
          )
        return out
      }
      const kind = (value: unknown) =>
        Array.isArray(value)
          ? 'array'
          : typeof value === 'number'
            ? 'bigint'
            : typeof value
      if (kind(got) !== kind(expected)) return [null, null]
      return [got, expected]
    }
    for (const member of unique.filter((member) =>
      member.key.startsWith('call'),
    )) {
      const args = probe(member.fn)
      if (!args) continue
      add({
        id: `round trip: ${member.name.split(':')[1]} encodes calldata that decodes back`,
        oracle: 'round trip',
        covers: [member.name],
        runs: 40,
        arb: fc.record(
          Object.fromEntries(
            Object.entries(args).map(([key, value]) => [key, like(value)]),
          ),
        ),
        check(input: Record<string, unknown>) {
          let result: Any
          try {
            result = member.fn(input)
          } catch (error) {
            if (documented(error)) return // Out-of-range amounts and the like are rejected.
            throw crash(member.name, error)
          }
          for (const callItem of Array.isArray(result) ? result : [result]) {
            if (!callItem?.abi || !callItem.data) continue
            const decoded = call('viem:decodeFunctionData', {
              abi: callItem.abi,
              data: callItem.data,
            })
            same(
              member.name,
              decoded.functionName,
              callItem.functionName,
              'function name in calldata',
            )
            const [got, expected] = alike(
              decoded.args ?? [],
              callItem.args ?? [],
            )
            same(
              member.name,
              canonical(got),
              canonical(expected),
              `calldata of ${callItem.functionName} decodes to its args`,
            )
          }
        },
      })
    }
  }

  return props
}

// ---------------------------------------------------------------------------------------------
// Seeds for functions no test calls with replayable arguments. The mutator treats them like
// recorded calls; a seed that throws as written is dropped, so a wrong seed costs coverage, not a
// false failure.

export function seeds(lib: Lib): Record<string, unknown[][]> {
  const viem = lib.v.viem as Any
  const chains = lib.v['viem/chains'] as Any
  const address = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
  const token = '0x20c0000000000000000000000000000000000001'
  const privateKey =
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  const hash = `0x${'ab'.repeat(32)}`
  const out: Record<string, unknown[][]> = {}
  const set = (name: string, ...argumentSets: unknown[][]) => {
    out[name] = argumentSets
  }
  /** Builds a group of seeds; a group whose setup throws is skipped. */
  const group = (build: () => void) => {
    try {
      build()
    } catch {}
  }

  // Tokens: one function per token, from a chain ID.
  for (const [name, value] of Object.entries<Any>(lib.v['viem/tokens']))
    if (typeof value === 'function' && name !== 'defineToken')
      set(`viem/tokens:${name}`, [1], [4217], [42431], [8453], [10])

  // Tempo time helpers and token IDs.
  for (const unit of [
    'seconds',
    'minutes',
    'hours',
    'days',
    'weeks',
    'months',
    'years',
  ])
    set(`viem/tempo:Period.${unit}`, [1], [0], [30])
  set('viem/tempo:TokenId.compute', [{ sender: address, salt: hash }])
  set('viem/tempo:TokenId.from', [1n], [token], [0n])
  set('viem/tempo:VirtualAddress.isVirtual', [address], [token])
  set('viem/tempo:VirtualAddress.validate', [address], [token])
  group(() => {
    const virtual = (lib.v['viem/tempo'] as Any).VirtualAddress.from({
      masterId: '0x01020304',
      userTag: '0x0a0b0c0d0e0f',
    })
    set('viem/tempo:VirtualAddress.parse', [virtual])
  })
  set('viem/tempo:VirtualMaster.getMasterId', [{ address, salt: hash }])
  set('viem/tempo:VirtualMaster.getRegistrationHash', [{ address, salt: hash }])
  set('viem/tempo:VirtualMaster.validateSalt', [{ address, salt: hash }])
  set(
    'viem/tempo:EarnShares.toAmount',
    [{ engineShares: 1000n, shareSupply: 2000n }, 10n],
    [{ engineShares: 1n, shareSupply: 1n }, 0n],
  )
  set('viem/tempo:EarnShares.toAmountUp', [
    { engineShares: 1000n, shareSupply: 2000n },
    10n,
  ])
  set('viem/tempo:EarnShares.toVenueAmount', [
    { engineShares: 1000n, shareSupply: 2000n },
    10n,
  ])
  set('viem/tempo:EarnShares.feeShares', [
    { activeAssets: 1000n, shareSupply: 2000n, totalFeeAssets: 10n },
  ])
  const channel = {
    payer: address,
    payee: token,
    token,
    salt: hash,
    expiringNonceHash: hash,
  }
  set('viem/tempo:Channel.computeId', [channel, { chainId: 4217 }])
  set('viem/tempo:Channel.domainSeparator', [{ chainId: 4217 }])
  set('viem/tempo:Channel.getVoucherSignPayload', [
    { channelId: hash, cumulativeAmount: 10n, chainId: 4217 },
  ])

  // ox's byte, key, and curve helpers that viem/tempo re-exports.
  const bytes = Uint8Array.from([0, 1, 2, 255])
  set('viem/tempo:Bytes.assert', [bytes])
  set('viem/tempo:Bytes.concat', [bytes, Uint8Array.from([9])])
  set('viem/tempo:Bytes.from', ['0x0102'], [bytes], [[1, 2, 3]])
  set('viem/tempo:Bytes.fromArray', [[1, 2, 3]])
  set('viem/tempo:Bytes.fromBoolean', [true], [false, { size: 32 }])
  set('viem/tempo:Bytes.fromHex', ['0x0102'], ['0x0102', { size: 4 }])
  set(
    'viem/tempo:Bytes.fromNumber',
    [255],
    [255n, { size: 4 }],
    [-1n, { size: 2, signed: true }],
  )
  set('viem/tempo:Bytes.fromString', ['hello'], ['hello', { size: 8 }])
  set('viem/tempo:Bytes.isEqual', [bytes, bytes])
  set('viem/tempo:Bytes.padLeft', [bytes, 8])
  set('viem/tempo:Bytes.padRight', [bytes, 8])
  set('viem/tempo:Bytes.random', [8])
  set('viem/tempo:Bytes.size', [bytes])
  set('viem/tempo:Bytes.slice', [bytes, 1, 3], [bytes, 1, 3, { strict: true }])
  set('viem/tempo:Bytes.toBigInt', [bytes], [bytes, { signed: true }])
  set('viem/tempo:Bytes.toBoolean', [Uint8Array.from([1])])
  set('viem/tempo:Bytes.toHex', [bytes])
  set('viem/tempo:Bytes.toNumber', [bytes], [bytes, { signed: true }])
  set('viem/tempo:Bytes.toString', [Uint8Array.from([104, 105])])
  set('viem/tempo:Bytes.trimLeft', [Uint8Array.from([0, 0, 1])])
  set('viem/tempo:Bytes.trimRight', [Uint8Array.from([1, 0, 0])])
  set('viem/tempo:Bytes.validate', [bytes], ['0x01'])
  group(() => {
    const uncompressed = (lib.ox.Secp256k1 as Any).getPublicKey({ privateKey })
    const publicKeyHex = (lib.ox.PublicKey as Any).toHex(uncompressed)
    set('viem/tempo:PublicKey.assert', [uncompressed])
    set('viem/tempo:PublicKey.compress', [uncompressed])
    set('viem/tempo:PublicKey.from', [publicKeyHex], [uncompressed])
    set('viem/tempo:PublicKey.fromBytes', [
      (lib.ox.PublicKey as Any).toBytes(uncompressed),
    ])
    set('viem/tempo:PublicKey.fromHex', [publicKeyHex])
    set(
      'viem/tempo:PublicKey.toBytes',
      [uncompressed],
      [uncompressed, { includePrefix: false }],
    )
    set(
      'viem/tempo:PublicKey.toHex',
      [uncompressed],
      [uncompressed, { includePrefix: false }],
    )
    set('viem/tempo:PublicKey.validate', [uncompressed])
    set('viem/tempo:Secp256k1.getPublicKey', [{ privateKey }])
    set('viem/tempo:Secp256k1.getSharedSecret', [
      { privateKey, publicKey: uncompressed },
    ])
    set('viem/tempo:Secp256k1.sign', [{ payload: hash, privateKey }])
    const signed = (lib.ox.Secp256k1 as Any).sign({ payload: hash, privateKey })
    set('viem/tempo:Secp256k1.recoverAddress', [
      { payload: hash, signature: signed },
    ])
    set('viem/tempo:Secp256k1.recoverPublicKey', [
      { payload: hash, signature: signed },
    ])
    set(
      'viem/tempo:Secp256k1.verify',
      [{ payload: hash, publicKey: uncompressed, signature: signed }],
      [{ payload: hash, address, signature: signed }],
    )
    set('viem/tempo:Secp256k1.fromSeed', [new Uint8Array(32).fill(7)])
    set('viem/tempo:Secp256k1.fromMnemonic', [
      'test test test test test test test test test test test junk',
    ])
    set('viem/tempo:Secp256k1.createKeyPair', [])
    set('viem/tempo:Secp256k1.randomPrivateKey', [])
    set('viem/tempo:Account.from', [
      {
        keyType: 'secp256k1',
        publicKey: (lib.ox.Secp256k1 as Any).getPublicKey({ privateKey }),
        sign: async ({ hash }: { hash: string }) =>
          (lib.ox.Signature as Any).toHex(
            (lib.ox.Secp256k1 as Any).sign({ payload: hash, privateKey }),
          ),
      },
    ])

    // Tempo key authorizations and signature envelopes.
    const keyAuthorization = {
      address,
      chainId: 4217n,
      expiry: 1234567890,
      type: 'secp256k1',
      limits: [{ token, limit: 10n }],
    }
    const KeyAuthorization = lib.ox['tempo/KeyAuthorization'] as Any
    const signedAuthorization = KeyAuthorization.from(keyAuthorization, {
      signature: { type: 'secp256k1', signature: signed },
    })
    for (const fn of [
      'from',
      'getSignPayload',
      'hash',
      'serialize',
      'toRpc',
      'toTuple',
    ])
      set(
        `viem/tempo:Account.z_KeyAuthorization.${fn}`,
        [keyAuthorization],
        [signedAuthorization],
      )
    set('viem/tempo:Account.z_KeyAuthorization.deserialize', [
      KeyAuthorization.serialize(signedAuthorization),
    ])
    set('viem/tempo:Account.z_KeyAuthorization.fromRpc', [
      KeyAuthorization.toRpc(signedAuthorization),
    ])
    set('viem/tempo:Account.z_KeyAuthorization.fromTuple', [
      KeyAuthorization.toTuple(signedAuthorization),
    ])
    const envelope = { type: 'secp256k1', signature: signed }
    const SignatureEnvelope = lib.ox['tempo/SignatureEnvelope'] as Any
    for (const fn of [
      'assert',
      'getType',
      'serialize',
      'toRpc',
      'validate',
      'from',
    ])
      set(`viem/tempo:Account.z_SignatureEnvelope.${fn}`, [envelope])
    set('viem/tempo:Account.z_SignatureEnvelope.deserialize', [
      SignatureEnvelope.serialize(envelope),
    ])
    set('viem/tempo:Account.z_SignatureEnvelope.fromRpc', [
      SignatureEnvelope.toRpc(envelope),
    ])
    set('viem/tempo:Account.z_SignatureEnvelope.extractAddress', [
      { payload: hash, signature: envelope },
    ])
    set('viem/tempo:Account.z_SignatureEnvelope.extractPublicKey', [
      { payload: hash, signature: envelope },
    ])
    set('viem/tempo:Account.z_SignatureEnvelope.verify', [
      envelope,
      { payload: hash, address },
    ])
    const tx = {
      chainId: 4217,
      nonce: 0n,
      gas: 21000n,
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
      calls: [{ to: address, value: 1n, data: '0x' }],
    }
    for (const fn of [
      'assert',
      'encodeForSigning',
      'getSignPayload',
      'hash',
      'validate',
    ])
      set(`viem/tempo:Account.z_TxEnvelopeTempo.${fn}`, [tx])
    set('viem/tempo:Account.z_TxEnvelopeTempo.getFeePayerSignPayload', [
      tx,
      { sender: address },
    ])
  })

  // viem utilities that take callbacks, errors, or chains.
  const BaseError = lib.BaseError as Any
  set('viem:extractChain', [
    { chains: [chains.mainnet, chains.optimism, chains.base], id: 10 },
  ])
  set(
    'viem:defineBlock',
    [{ format: (block: Any) => ({ extra: block.hash }) }],
    [{ exclude: ['hash'], format: () => ({}) }],
  )
  set('viem:defineTransaction', [{ format: () => ({}) }])
  set('viem:defineTransactionReceipt', [{ format: () => ({}) }])
  set('viem:defineTransactionRequest', [{ format: () => ({}) }])
  set('viem/utils:defineFormatter', ['block', (value: Any) => value])
  set('viem:defineKzg', [
    {
      blobToKzgCommitment: (blob: Uint8Array) => blob.slice(0, 48),
      computeBlobKzgProof: (blob: Uint8Array) => blob.slice(0, 48),
    },
  ])
  set(
    'viem:custom',
    [{ request: async () => null }],
    [{ request: async () => null }, { retryCount: 0, name: 'Custom' }],
  )
  set('viem:createTransport', [
    {
      key: 'custom',
      name: 'Custom',
      request: async () => null,
      type: 'custom',
      retryCount: 0,
    },
  ])
  set('viem:rpcSchema', [])
  set('viem/nonce:jsonRpc', [])
  set(
    'viem:parseAbi',
    [
      [
        'function balanceOf(address owner) view returns (uint256)',
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'error Unauthorized(address caller)',
      ],
    ],
    [
      [
        'struct Pair { uint256 a; bool b; }',
        'function f(Pair pair) returns (Pair[] memory pairs)',
      ],
    ],
  )
  set(
    'viem:parseAbiParameter',
    ['uint256 indexed amount'],
    ['(address to, uint256 value)[] transfers'],
  )
  set(
    'viem:shouldThrow',
    [new Error('nonce too low')],
    [new BaseError('execution reverted')],
  )
  set('viem:getContractError', [
    new BaseError('execution reverted'),
    {
      abi: viem.erc20Abi,
      address,
      args: [address, 1n],
      functionName: 'transfer',
    },
  ])
  set('viem/utils:getCallError', [
    new BaseError('execution reverted'),
    { to: address, data: '0x' },
  ])
  set('viem/utils:getEstimateGasError', [
    new BaseError('execution reverted'),
    { to: address, data: '0x' },
  ])
  set('viem/utils:getTransactionError', [
    new BaseError('nonce too low'),
    { to: address },
  ])
  set(
    'viem/utils:getNodeError',
    [new BaseError('nonce too low'), { nonce: 1 }],
    [new BaseError('insufficient funds for gas * price + value'), {}],
  )
  set('viem/utils:containsNodeError', [new BaseError('nonce too low')])
  set(
    'viem/account-abstraction:getBundlerError',
    [new BaseError("AA21 didn't pay prefund"), {}],
    [new BaseError('AA25 invalid account nonce'), { nonce: 1n }],
  )
  set('viem/account-abstraction:getUserOperationError', [
    new BaseError("AA21 didn't pay prefund"),
    { calls: [{ to: address, data: '0x' }], callData: '0x', sender: address },
  ])
  set('viem/experimental/erc7821:getExecuteError', [
    new BaseError('execution reverted'),
    { calls: [{ to: address, data: '0x' }] },
  ])
  set(
    'viem/experimental/erc7821:encodeCalls',
    [[{ to: address, data: '0x12345678', value: 1n }]],
    [[{ to: address }], '0xdead'],
  )
  set(
    'viem/experimental/erc7821:encodeExecuteData',
    [{ calls: [{ to: address, data: '0x12345678', value: 1n }] }],
    [{ calls: [{ to: address }], opData: '0xdead' }],
  )
  set('viem/experimental/erc7821:encodeExecuteBatchesData', [
    {
      batches: [
        { calls: [{ to: address, data: '0x' }] },
        { calls: [{ to: address, value: 2n }], opData: '0xbeef' },
      ],
    },
  ])
  const verifierDomain = {
    name: 'Account',
    version: '1',
    chainId: 1,
    verifyingContract: address,
    salt: hash,
  }
  set(
    'viem/experimental/erc7739:hashMessage',
    [{ message: 'hello world', verifierDomain }],
    [{ message: { raw: '0xdeadbeef' }, verifierDomain }],
  )
  set('viem/experimental/erc7739:hashTypedData', [
    {
      domain: {
        name: 'Mail',
        version: '1',
        chainId: 1,
        verifyingContract: token,
      },
      types: { Mail: [{ name: 'contents', type: 'string' }] },
      primaryType: 'Mail',
      message: { contents: 'hello' },
      verifierDomain,
    },
  ])
  set('viem/node:ipc', ['/nonexistent/fuzz.ipc'])
  set('viem:withCache', [async () => 1, { cacheKey: 'fuzz' }])
  set('viem:withTimeout', [async () => 1, { timeout: 100 }])
  set('viem:withRetry', [async () => 1, { retryCount: 1, delay: 1 }])
  set('viem:sidecarsToVersionedHashes', [
    {
      sidecars: [
        {
          blob: new Uint8Array(131072),
          commitment: `0x${'c0'.repeat(48)}`,
          proof: `0x${'c0'.repeat(48)}`,
        },
      ],
    },
  ])
  set('viem/accounts:setSignEntropy', [true], [false])
  // A stand-in KZG: the blob helpers only route blobs through it.
  const kzg = {
    blobToKzgCommitment: (blob: Uint8Array) => blob.slice(0, 48),
    computeBlobKzgProof: (blob: Uint8Array) => blob.slice(0, 48),
  }
  const blob = new Uint8Array(131072).fill(1)
  set(
    'viem:blobsToCommitments',
    [{ blobs: [blob], kzg }],
    [{ blobs: [toHex(blob)], kzg, to: 'bytes' }],
  )
  set(
    'viem:blobsToProofs',
    [{ blobs: [blob], commitments: [blob.slice(0, 48)], kzg }],
    [{ blobs: [toHex(blob)], commitments: [toHex(blob.slice(0, 48))], kzg }],
  )
  set('viem:createNonceManager', [
    { source: { get: async () => 0, set: async () => {} } },
  ])
  set(
    'viem/utils:buildRequest',
    [async () => 1],
    [async () => 1, { retryCount: 0 }],
  )
  group(() => {
    const HDKey = (lib.v['viem/accounts'] as Any).HDKey
    const hdKey = HDKey.fromMasterSeed(new Uint8Array(32).fill(1))
    set(
      'viem/accounts:hdKeyToAccount',
      [hdKey],
      [hdKey, { accountIndex: 1, addressIndex: 2, changeIndex: 0 }],
      [hdKey, { path: "m/44'/60'/0'/0/5" }],
    )
  })
  set('viem/tempo:Formatters.formatTransactionReceipt', [
    {
      blockHash: hash,
      blockNumber: '0x1',
      contractAddress: null,
      cumulativeGasUsed: '0x5208',
      effectiveGasPrice: '0x1',
      from: address,
      gasUsed: '0x5208',
      logs: [],
      logsBloom: `0x${'00'.repeat(256)}`,
      status: '0x1',
      to: token,
      transactionHash: hash,
      transactionIndex: '0x0',
      type: '0x76',
      feeToken: token,
      feePayer: address,
    },
  ])

  // OP Stack logs, built from the portal and message passer events.
  group(() => {
    const portal = new lib.ethers.Interface([
      'event TransactionDeposited(address indexed from, address indexed to, uint256 indexed version, bytes opaqueData)',
    ])
    const passer = new lib.ethers.Interface([
      'event MessagePassed(uint256 indexed nonce, address indexed sender, address indexed target, uint256 value, uint256 gasLimit, bytes data, bytes32 withdrawalHash)',
    ])
    const opaqueData = viem.encodePacked(
      ['uint256', 'uint256', 'uint64', 'bool', 'bytes'],
      [1n, 2n, 21000n, false, '0xdeadbeef'],
    )
    const meta = {
      blockHash: hash,
      blockNumber: 1n,
      logIndex: 0,
      transactionHash: hash,
      transactionIndex: 0,
      removed: false,
    }
    const deposited = {
      address,
      ...meta,
      ...portal.encodeEventLog('TransactionDeposited', [
        address,
        token,
        0n,
        opaqueData,
      ]),
    }
    const passed = {
      address,
      ...meta,
      ...passer.encodeEventLog('MessagePassed', [
        1n,
        address,
        token,
        1n,
        21000n,
        '0x',
        hash,
      ]),
    }
    set('viem/op-stack:extractTransactionDepositedLogs', [
      { logs: [deposited, passed] },
    ])
    set('viem/op-stack:getL2TransactionHash', [
      {
        log: (lib.v['viem/op-stack'] as Any).extractTransactionDepositedLogs({
          logs: [deposited],
        })[0],
      },
    ])
    set('viem/op-stack:getL2TransactionHashes', [{ logs: [deposited, passed] }])
    set('viem/op-stack:extractWithdrawalMessageLogs', [
      { logs: [deposited, passed] },
    ])
    set('viem/op-stack:getWithdrawals', [{ logs: [deposited, passed] }])
  })
  return out
}

// ---------------------------------------------------------------------------------------------
// Helpers.

const secp256k1N =
  0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n

function toHex(bytes: Uint8Array) {
  let out = '0x'
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0')
  return out
}

function toHex32(value: bigint) {
  return `0x${value.toString(16).padStart(64, '0')}`
}

function hexBytes(hex: string) {
  const body = hex.slice(2)
  const out = new Uint8Array(body.length / 2)
  for (let i = 0; i < out.length; i++)
    out[i] = Number.parseInt(body.slice(i * 2, i * 2 + 2), 16)
  return out
}

function trimBytes(bytes: Uint8Array, dir: string) {
  let start = 0
  let end = bytes.length
  if (dir === 'left') while (start < end - 1 && bytes[start] === 0) start++
  else while (end > start + 1 && bytes[end - 1] === 0) end--
  return bytes.slice(start, end)
}

function mapRlp(value: unknown, map: (hex: string) => unknown): unknown {
  return Array.isArray(value)
    ? value.map((item) => mapRlp(item, map))
    : map(value as string)
}

function isStatic(param: { type: string; components?: unknown[] }): boolean {
  if (
    /\[\]$/.test(param.type) ||
    param.type === 'bytes' ||
    param.type === 'string'
  )
    return false
  if (/^tuple/.test(param.type) || /\[\d+\]$/.test(param.type)) return false
  return true
}

function stripNames(params: Any[]): Any[] {
  return params.map(({ type, components }) =>
    components ? { type, components: stripNames(components) } : { type },
  )
}

function short(name: string) {
  return name.split(':')[1] ?? name
}

function siteOf(error: unknown) {
  const stack = String((error as Error)?.stack ?? '')
  for (const line of stack.split('\n').slice(1)) {
    const match = line.match(/\(?(?:file:\/\/)?([^\s()]+):(\d+):\d+\)?$/)
    if (!match || /fuzz-|node:|fast-check/.test(match[1]!)) continue
    return `${match[1]!.replace(/^.*\/src\/_esm\//, 'src/_esm/').replace(/^.*\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?/, '')}:${match[2]}`
  }
  return undefined
}

function show(value: unknown): string {
  const text = JSON.stringify(value, (_, item) =>
    typeof item === 'bigint'
      ? `${item}n`
      : item instanceof Uint8Array
        ? `bytes(${toHex(item)})`
        : item,
  )
  if (text === undefined) return String(value)
  return text.length > 200 ? `${text.slice(0, 199)}…` : text
}

function equal(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b) return false
  if (a instanceof Uint8Array && b instanceof Uint8Array)
    return a.length === b.length && a.every((byte, i) => byte === b[i])
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((item, i) => equal(item, b[i]))
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) {
      const x = (a as Record<string, unknown>)[key]
      const y = (b as Record<string, unknown>)[key]
      if (x === undefined && y === undefined) continue
      if (!equal(x, y)) return false
    }
    return true
  }
  return false
}
