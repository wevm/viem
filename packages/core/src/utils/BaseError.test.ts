import { expect, test } from 'vitest'

import { BaseError } from './BaseError'

test('BaseError', () => {
  expect(new BaseError('An error occurred.')).toMatchInlineSnapshot(`
    [ViemError: An error occurred.

    Version: viem@1.0.2]
  `)

  expect(new BaseError('An error occurred.', { details: 'details' }))
    .toMatchInlineSnapshot(`
    [ViemError: An error occurred.

    Details: details
    Version: viem@1.0.2]
  `)
})

test('BaseError (w/ docsPath)', () => {
  expect(
    new BaseError('An error occurred.', {
      details: 'details',
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [ViemError: An error occurred.

    Docs: https://viem.sh/lol

    Details: details
    Version: viem@1.0.2]
  `)
})

test('inherited BaseError', () => {
  const err = new BaseError('An error occurred.', {
    details: 'details',
    docsPath: '/lol',
  })
  expect(
    new BaseError('An internal error occurred.', {
      cause: err,
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
    new BaseError('An internal error occurred.', {
      cause: err,
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [ViemError: An internal error occurred.

    Docs: https://viem.sh/lol

    Details: details
    Version: viem@1.0.2]
  `)
})
