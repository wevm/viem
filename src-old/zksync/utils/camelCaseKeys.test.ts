import { expect, test } from 'vitest'
import { camelCaseKeys } from './camelCaseKeys.js'

test('default', () => {
  expect(
    camelCaseKeys({
      foo_bar: 'baz',
    }),
  ).toMatchInlineSnapshot(`
    {
      "fooBar": "baz",
    }
  `)

  expect(
    camelCaseKeys([
      {
        foo_bar: 'baz',
      },
    ]),
  ).toMatchInlineSnapshot(`
    [
      {
        "fooBar": "baz",
      },
    ]
  `)

  expect(
    camelCaseKeys({
      foo_bar: [{ baz_bar: 'baz' }],
    }),
  ).toMatchInlineSnapshot(`
    {
      "fooBar": [
        {
          "bazBar": "baz",
        },
      ],
    }
  `)

  expect(
    camelCaseKeys({
      foo_bar: [{ baz_bar: 'baz' }, null],
    }),
  ).toMatchInlineSnapshot(`
    {
      "fooBar": [
        {
          "bazBar": "baz",
        },
        null,
      ],
    }
  `)
})
