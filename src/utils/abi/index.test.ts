import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(utils).toMatchInlineSnapshot(`
    {
      "decodeAbiParameters": [Function],
      "decodeErrorResult": [Function],
      "decodeEventLog": [Function],
      "decodeFunctionData": [Function],
      "decodeFunctionResult": [Function],
      "encodeAbiParameters": [Function],
      "encodeDeployData": [Function],
      "encodeErrorResult": [Function],
      "encodeEventTopics": [Function],
      "encodeFunctionData": [Function],
      "encodeFunctionResult": [Function],
      "encodePacked": [Function],
      "formatAbiItem": [Function],
      "formatAbiItemWithArgs": [Function],
      "getAbiItem": [Function],
      "parseAbi": [Function],
      "parseAbiItem": [Function],
      "parseAbiParameter": [Function],
      "parseAbiParameters": [Function],
    }
  `)
})
