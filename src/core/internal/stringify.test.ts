import { expect, test } from 'vitest'

import { stringify } from './stringify.js'

test('default', () => {
  expect(
    stringify({
      foo: 'bar',
      baz: {
        value: 69n,
      },
    }),
  ).toEqual('{"foo":"bar","baz":{"value":"69"}}')
})

test('args: replacer', () => {
  expect(
    stringify(
      {
        foo: 'bar',
        baz: {
          value: 69n,
        },
      },
      (key, value) => {
        if (key === 'value') {
          return `${value}!`
        }
        return value
      },
    ),
  ).toEqual('{"foo":"bar","baz":{"value":"69!"}}')
})

test('args: space', () => {
  expect(
    stringify(
      {
        foo: 'bar',
        baz: {
          value: 69n,
        },
      },
      null,
      2,
    ),
  ).toMatchInlineSnapshot(`
    "{
      "foo": "bar",
      "baz": {
        "value": "69"
      }
    }"
  `)
})
