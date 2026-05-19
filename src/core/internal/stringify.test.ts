import { describe, expect, test } from 'vp/test'

import { stringify } from './stringify.js'

describe('stringify', () => {
  test('behavior: serializes bigint values', () => {
    expect(
      stringify({
        foo: 'bar',
        baz: {
          value: 69n,
        },
      }),
    ).toMatchInlineSnapshot(`"{"foo":"bar","baz":{"value":"69"}}"`)
  })

  test('behavior: passes converted values to function replacers', () => {
    expect(
      stringify(
        {
          foo: 'bar',
          baz: {
            value: 69n,
          },
        },
        (key, value) => {
          if (key === 'value') return `${value}!`
          return value
        },
      ),
    ).toMatchInlineSnapshot(`"{"foo":"bar","baz":{"value":"69!"}}"`)
  })

  test('behavior: supports JSON spacing', () => {
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
})
