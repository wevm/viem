import { expect, test } from 'vitest'

import { BaseError } from './BaseError'

test('BaseError', () => {
  expect(
    new BaseError({ details: 'details', humanMessage: 'An error occurred.' }),
  ).toMatchInlineSnapshot(`
    [ViemError: An error occurred.

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
    [ViemError: An error occurred.

    Docs: https://viem.sh/lol

    Details: details
    Version: viem@1.0.2]
  `)
})

test('inherited BaseError', () => {
  const err = new BaseError({
    details: 'details',
    docsLink: 'https://viem.sh/lol',
    humanMessage: 'An error occurred.',
  })
  expect(
    new BaseError({
      cause: err,
      humanMessage: 'An internal error occurred.',
    }),
  ).toMatchInlineSnapshot(`
    [ViemError: An internal error occurred.

    Docs: https://viem.sh/lol

    Details: details
    Version: viem@1.0.2]
  `)
})

test('inherited Error', () => {
  const err = new Error('details')
  expect(
    new BaseError({
      cause: err,
      docsLink: 'https://viem.sh/lol',
      humanMessage: 'An internal error occurred.',
    }),
  ).toMatchInlineSnapshot(`
    [ViemError: An internal error occurred.

    Docs: https://viem.sh/lol

    Details: details
    Version: viem@1.0.2]
  `)
})
