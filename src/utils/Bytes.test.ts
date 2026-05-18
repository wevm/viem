import { expect, test } from 'vitest'

import { concatBytes } from '../../src-old/utils/data/concat.js'
import { padBytes } from '../../src-old/utils/data/pad.js'
import { sliceBytes } from '../../src-old/utils/data/slice.js'
import { trim } from '../../src-old/utils/data/trim.js'
import {
  bytesToBigInt,
  bytesToBool,
  bytesToNumber,
  bytesToString,
  fromBytes,
} from '../../src-old/utils/encoding/fromBytes.js'
import {
  boolToBytes,
  hexToBytes,
  numberToBytes,
  stringToBytes,
} from '../../src-old/utils/encoding/toBytes.js'
import { bytesToHex } from '../../src-old/utils/encoding/toHex.js'
import * as Bytes from './Bytes.js'

test('matches retained v2 bytes encoding behavior', () => {
  expect({
    boolean: Bytes.fromBoolean(true),
    booleanSized: Bytes.fromBoolean(true, { size: 4 }),
    hex: Bytes.fromHex('0x01a4'),
    hexSized: Bytes.fromHex('0x01a4', { size: 4 }),
    number: Bytes.fromNumber(420),
    numberSized: Bytes.fromNumber(420, { size: 4 }),
    string: Bytes.fromString('viem'),
    stringSized: Bytes.fromString('viem', { size: 8 }),
  }).toEqual({
    boolean: boolToBytes(true),
    booleanSized: boolToBytes(true, { size: 4 }),
    hex: hexToBytes('0x01a4'),
    hexSized: hexToBytes('0x01a4', { size: 4 }),
    number: numberToBytes(420),
    numberSized: numberToBytes(420, { size: 4 }),
    string: stringToBytes('viem'),
    stringSized: stringToBytes('viem', { size: 8 }),
  })
})

test('matches retained v2 bytes decoding behavior', () => {
  const bytes = new Uint8Array([1, 164])
  const stringBytes = new Uint8Array([118, 105, 101, 109])

  expect({
    bigint: Bytes.toBigInt(bytes),
    boolean: Bytes.toBoolean(new Uint8Array([1])),
    fromBigint: fromBytes(bytes, 'bigint'),
    fromBoolean: fromBytes(new Uint8Array([1]), 'boolean'),
    fromHex: fromBytes(bytes, 'hex'),
    fromNumber: fromBytes(bytes, 'number'),
    fromString: fromBytes(stringBytes, 'string'),
    hex: Bytes.toHex(bytes),
    number: Bytes.toNumber(bytes),
    string: Bytes.toString(stringBytes),
  }).toEqual({
    bigint: bytesToBigInt(bytes),
    boolean: bytesToBool(new Uint8Array([1])),
    fromBigint: Bytes.toBigInt(bytes),
    fromBoolean: Bytes.toBoolean(new Uint8Array([1])),
    fromHex: Bytes.toHex(bytes),
    fromNumber: Bytes.toNumber(bytes),
    fromString: Bytes.toString(stringBytes),
    hex: bytesToHex(bytes),
    number: bytesToNumber(bytes),
    string: bytesToString(stringBytes),
  })
})

test('matches retained v2 bytes data behavior', () => {
  const bytes = new Uint8Array([1, 2, 3])

  expect({
    concat: Bytes.concat(new Uint8Array([1]), new Uint8Array([2, 3])),
    padLeft: Bytes.padLeft(new Uint8Array([1, 2]), 4),
    padRight: Bytes.padRight(new Uint8Array([1, 2]), 4),
    slice: Bytes.slice(bytes, 1, 3),
    trimLeft: Bytes.trimLeft(new Uint8Array([0, 0, 1, 2])),
    trimRight: Bytes.trimRight(new Uint8Array([1, 2, 0, 0])),
  }).toEqual({
    concat: concatBytes([new Uint8Array([1]), new Uint8Array([2, 3])]),
    padLeft: padBytes(new Uint8Array([1, 2]), { size: 4 }),
    padRight: padBytes(new Uint8Array([1, 2]), { dir: 'right', size: 4 }),
    slice: sliceBytes(bytes, 1, 3),
    trimLeft: trim(new Uint8Array([0, 0, 1, 2])),
    trimRight: trim(new Uint8Array([1, 2, 0, 0]), { dir: 'right' }),
  })
})
