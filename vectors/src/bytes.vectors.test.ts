import { join } from 'node:path'
import { describe, expect, test } from 'bun:test'

import {
  hexToBytes_buffer,
  hexToBytes_native,
} from '../../src/utils/encoding/toBytes.js'
import {
  bytesToHex_buffer,
  bytesToHex_native,
} from '../../src/utils/encoding/toHex.js'
import { readGzippedJson } from '../utils.js'

const vectors = await readGzippedJson(join(import.meta.dir, './bytes.json.gz'))

describe('hexToBytes', () => {
  vectors.forEach((v, i) => {
    test(`${i}`, () => {
      expect(hexToBytes_native(v)).toEqual(hexToBytes_buffer(v))
    })
  })
})

describe('bytesToHex', () => {
  vectors.forEach((v, i) => {
    test(`${i}`, () => {
      expect(bytesToHex_native(hexToBytes_native(v))).toEqual(
        bytesToHex_buffer(hexToBytes_native(v)),
      )
    })
  })
})
