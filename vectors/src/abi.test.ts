/// <reference types="@types/bun" />

import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

import { readGzippedJson } from '../utils.js';
import { decodeAbiParameters, encodeAbiParameters } from '../../src/index.js';

const vectors = await readGzippedJson(join(import.meta.dir, './abi.json.gz'));

describe.skip('encodeAbiParameters', () => {
  vectors.forEach((v, i) => {
    test(`${i}`, () => {
      expect(encodeAbiParameters(v.parameters, v.values)).toEqual(v.encoded)
    });
  });
})

describe.skip('decodeAbiParameters', () => {
  vectors.forEach((v, i) => {
    test(`${i}`, () => {
      expect(decodeAbiParameters(v.parameters, v.encoded)).toEqual(v.values)
    });
  });
})
