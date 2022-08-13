import { expect, test } from 'vitest'

import { BaseError } from './BaseError'

test('BaseError', () => {
  expect(
    new BaseError({ details: 'details', humanMessage: 'An error occurred.' }),
  ).toMatchInlineSnapshot(`
    [Error: An error occurred.

    Details: details
    Version: viem@1.0.2]
  `)
})

test('BaseError (w/ docsLink)', () => {
  expect(
    new BaseError({
      details: 'details',
      humanMessage: 'An error occurred.',
      docsLink: 'https://viem.sh/lol',
    }),
  ).toMatchInlineSnapshot(`
    [Error: An error occurred.

    Docs: https://viem.sh/lol

    Details: details
    Version: viem@1.0.2]
  `)
})
