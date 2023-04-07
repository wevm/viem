import { expect, test } from 'vitest'

import {
  extractFunctionName,
  extractFunctionParams,
  extractFunctionParts,
  extractFunctionType,
} from './extractFunctionParts.js'

test('extractFunctionParts', () => {
  expect(extractFunctionParts('foo()')).toMatchInlineSnapshot(`
    {
      "name": "foo",
      "params": undefined,
      "type": undefined,
    }
  `)
  expect(extractFunctionParts('bar(uint foo)')).toMatchInlineSnapshot(`
    {
      "name": "bar",
      "params": "uint foo",
      "type": undefined,
    }
  `)
  expect(
    extractFunctionParts('function bar(uint foo, address baz)'),
  ).toMatchInlineSnapshot(`
      {
        "name": "bar",
        "params": "uint foo, address baz",
        "type": "function",
      }
    `)
  expect(extractFunctionParts('event Baz()')).toMatchInlineSnapshot(`
    {
      "name": "Baz",
      "params": undefined,
      "type": "event",
    }
  `)
  expect(extractFunctionParts('event Barry(uint foo)')).toMatchInlineSnapshot(
    `
    {
      "name": "Barry",
      "params": "uint foo",
      "type": "event",
    }
  `,
  )
})

test('extractFunctionName', () => {
  expect(extractFunctionName('foo()')).toBe('foo')
  expect(extractFunctionName('bar(uint foo)')).toBe('bar')
  expect(extractFunctionName('event Baz()')).toBe('Baz')
  expect(extractFunctionName('event Barry(uint foo)')).toBe('Barry')
})

test('extractFunctionType', () => {
  expect(extractFunctionType('foo()')).toBeUndefined()
  expect(extractFunctionType('function bar(uint foo)')).toBe('function')
  expect(extractFunctionType('event Barry(uint foo)')).toBe('event')
})

test('extractFunctionParams', () => {
  expect(extractFunctionParams('foo()')).toMatchInlineSnapshot('undefined')
  expect(
    extractFunctionParams('bar(uint foo, address baz)'),
  ).toMatchInlineSnapshot(`
    [
      {
        "name": "foo",
        "type": "uint",
      },
      {
        "name": "baz",
        "type": "address",
      },
    ]
  `)
  expect(
    extractFunctionParams('bar(uint indexed foo, address baz)'),
  ).toMatchInlineSnapshot(`
    [
      {
        "indexed": true,
        "name": "foo",
        "type": "uint",
      },
      {
        "name": "baz",
        "type": "address",
      },
    ]
  `)
  expect(extractFunctionParams('event Baz()')).toMatchInlineSnapshot(
    'undefined',
  )
  expect(extractFunctionParams('event Barry(uint foo)')).toMatchInlineSnapshot(
    `
    [
      {
        "name": "foo",
        "type": "uint",
      },
    ]
  `,
  )
})
