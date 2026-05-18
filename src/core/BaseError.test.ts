import { describe, expect, test } from 'vp/test'

import { BaseError } from './BaseError.js'

describe('BaseError', () => {
  test('stamps viem version metadata', () => {
    expect(normalize(new BaseError('An error occurred.')))
      .toMatchInlineSnapshot(`
        [BaseError: An error occurred.

        Version: viem@x.y.z]
      `)
  })

  test('uses viem docs origin', () => {
    expect(
      normalize(
        new BaseError('An error occurred.', {
          details: 'details',
          docsPath: '/lol',
        }),
      ),
    ).toMatchInlineSnapshot(`
      [BaseError: An error occurred.

      Details: details
      See: https://viem.sh/lol
      Version: viem@x.y.z]
    `)
  })

  test('inherits details and docs path from causes', () => {
    expect(
      normalize(
        new BaseError('An internal error occurred.', {
          cause: new BaseError('cause', {
            details: 'details',
            docsPath: '/docs',
          }),
        }),
      ),
    ).toMatchInlineSnapshot(`
      [BaseError: An internal error occurred.

      Details: details
      See: https://viem.sh/docs
      Version: viem@x.y.z]
    `)
  })

  test('walks nested causes', () => {
    class FooError<cause extends Error | undefined> extends BaseError<cause> {}
    class BarError extends BaseError {}

    const error = new BaseError('test1', {
      cause: new FooError('test2', { cause: new BarError('test3') }),
    })

    expect(normalize(error.walk())).toMatchInlineSnapshot(`
      [BaseError: test3

      Version: viem@x.y.z]
    `)
    expect(normalize(error.walk((error) => error instanceof FooError)))
      .toMatchInlineSnapshot(`
        [BaseError: test2

        Details: test3
        Version: viem@x.y.z]
      `)
  })

  test('allows explicit docs origin and version overrides', () => {
    expect(
      new BaseError('An error occurred.', {
        docsOrigin: 'https://example.com',
        docsPath: '/docs',
        version: 'custom@1.0.0',
      }),
    ).toMatchInlineSnapshot(`
      [BaseError: An error occurred.

      See: https://example.com/docs
      Version: custom@1.0.0]
    `)
  })
})

function normalize(error: unknown) {
  if (error instanceof Error)
    error.message = error.message.replaceAll(
      /viem@\d+\.\d+\.\d+(?:-[\w.-]+)?/g,
      'viem@x.y.z',
    )
  return error
}
