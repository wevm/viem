/// <reference types="@types/bun" />

import { join } from 'node:path'
import { describe, expect, test } from 'bun:test'

import { fromRlp } from '../../src/utils/encoding/fromRlp.js'
import { toRlp } from '../../src/utils/encoding/toRlp.js'
import { readGzippedJson } from '../utils.js'

const vectors = await readGzippedJson(join(import.meta.dir, './rlp.json.gz'))

describe('toRlp', () => {
  vectors.forEach((v, i) => {
    test(`${i}`, () => {
      expect(toRlp(v.decoded)).toEqual(v.encoded)
    })
  })
})

describe('fromRlp', () => {
  vectors.forEach((v, i) => {
    test(`${i}`, () => {
      expect(fromRlp(v.encoded)).toEqual(v.decoded)
    })
  })
})
