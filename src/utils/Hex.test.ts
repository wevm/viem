import { expect, test } from 'vitest'

import { concatHex } from '../../src-old/utils/data/concat.js'
import { padHex } from '../../src-old/utils/data/pad.js'
import { sliceHex } from '../../src-old/utils/data/slice.js'
import { trim } from '../../src-old/utils/data/trim.js'
import {
  fromHex,
  hexToBigInt,
  hexToBool,
  hexToNumber,
  hexToString,
} from '../../src-old/utils/encoding/fromHex.js'
import { hexToBytes } from '../../src-old/utils/encoding/toBytes.js'
import {
  boolToHex,
  bytesToHex,
  numberToHex,
  stringToHex,
} from '../../src-old/utils/encoding/toHex.js'
import * as Hex from './Hex.js'

test('matches retained v2 hex encoding behavior', () => {
  const bytes = new Uint8Array([1, 164])

  expect({
    boolean: Hex.fromBoolean(true),
    booleanSized: Hex.fromBoolean(true, { size: 4 }),
    bytes: Hex.fromBytes(bytes),
    bytesSized: Hex.fromBytes(bytes, { size: 4 }),
    number: Hex.fromNumber(420),
    numberSized: Hex.fromNumber(420, { size: 4 }),
    signedNumber: Hex.fromNumber(-1, { signed: true, size: 1 }),
    string: Hex.fromString('viem'),
    stringSized: Hex.fromString('viem', { size: 8 }),
  }).toEqual({
    boolean: boolToHex(true),
    booleanSized: boolToHex(true, { size: 4 }),
    bytes: bytesToHex(bytes),
    bytesSized: bytesToHex(bytes, { size: 4 }),
    number: numberToHex(420),
    numberSized: numberToHex(420, { size: 4 }),
    signedNumber: numberToHex(-1, { signed: true, size: 1 }),
    string: stringToHex('viem'),
    stringSized: stringToHex('viem', { size: 8 }),
  })
})

test('matches retained v2 hex decoding behavior', () => {
  expect({
    bigint: Hex.toBigInt('0x1a4'),
    boolean: Hex.toBoolean('0x01'),
    bytes: Hex.toBytes('0x01a4'),
    fromBigint: fromHex('0x1a4', 'bigint'),
    fromBoolean: fromHex('0x01', 'boolean'),
    fromBytes: fromHex('0x01a4', 'bytes'),
    fromNumber: fromHex('0x1a4', 'number'),
    fromString: fromHex('0x7669656d', 'string'),
    number: Hex.toNumber('0x1a4'),
    string: Hex.toString('0x7669656d'),
  }).toEqual({
    bigint: hexToBigInt('0x1a4'),
    boolean: hexToBool('0x01'),
    bytes: hexToBytes('0x01a4'),
    fromBigint: Hex.toBigInt('0x1a4'),
    fromBoolean: Hex.toBoolean('0x01'),
    fromBytes: Hex.toBytes('0x01a4'),
    fromNumber: Hex.toNumber('0x1a4'),
    fromString: Hex.toString('0x7669656d'),
    number: hexToNumber('0x1a4'),
    string: hexToString('0x7669656d'),
  })
})

test('matches retained v2 hex data behavior', () => {
  expect({
    concat: Hex.concat('0x12', '0x34'),
    padLeft: Hex.padLeft('0x1234', 4),
    padRight: Hex.padRight('0x1234', 4),
    slice: Hex.slice('0x123456', 1, 3),
    trimLeft: Hex.trimLeft('0x00001234'),
    trimRight: Hex.trimRight('0x12340000'),
  }).toEqual({
    concat: concatHex(['0x12', '0x34']),
    padLeft: padHex('0x1234', { size: 4 }),
    padRight: padHex('0x1234', { dir: 'right', size: 4 }),
    slice: sliceHex('0x123456', 1, 3),
    trimLeft: trim('0x00001234'),
    trimRight: trim('0x12340000', { dir: 'right' }),
  })
})
