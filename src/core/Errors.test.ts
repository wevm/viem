import { afterAll, beforeAll, expect, test } from 'vitest'

import { version } from '../version.js'
import { BaseError, setConfig } from './Errors.js'

// Pin the rendered version so snapshots stay stable across releases.
beforeAll(() => setConfig({ version: 'viem@x.y.z' }))
afterAll(() =>
  setConfig({ docsOrigin: 'https://viem.sh', version: `viem@${version}` }),
)

test('BaseError', () => {
  expect(new BaseError('An error occurred.')).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Version: viem@x.y.z]
  `)

  expect(new BaseError('An error occurred.', { details: 'details' }))
    .toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Details: details
    Version: viem@x.y.z]
  `)

  expect(new BaseError('', { details: 'details' })).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Details: details
    Version: viem@x.y.z]
  `)
})

test('BaseError (w/ docsPath)', () => {
  expect(
    new BaseError('An error occurred.', {
      details: 'details',
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Details: details
    See: https://viem.sh/lol
    Version: viem@x.y.z]
  `)
  expect(
    new BaseError('An error occurred.', {
      cause: new BaseError('error', { docsPath: '/docs' }),
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Details: error
    See: https://viem.sh/docs
    Version: viem@x.y.z]
  `)
  expect(
    new BaseError('An error occurred.', {
      cause: new BaseError('error'),
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Details: error
    See: https://viem.sh/lol
    Version: viem@x.y.z]
  `)
})

test('BaseError (w/ docsOrigin)', () => {
  expect(
    new BaseError('An error occurred.', {
      docsOrigin: 'https://test',
      details: 'details',
      docsPath: '/lol',
    }),
  ).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Details: details
    See: https://test/lol
    Version: viem@x.y.z]
  `)
})

test('BaseError (w/ metaMessages)', () => {
  const error = new BaseError('An error occurred.', {
    details: 'details',
    metaMessages: ['Reason: idk', 'Cause: lol'],
  })
  expect(error).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Reason: idk
    Cause: lol

    Details: details
    Version: viem@x.y.z]
  `)
  expect(error.metaMessages).toEqual(['Reason: idk', 'Cause: lol'])
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
    [BaseError: An internal error occurred.

    Details: details
    See: https://viem.sh/lol
    Version: viem@x.y.z]
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
    [BaseError: An internal error occurred.

    Details: details
    See: https://viem.sh/lol
    Version: viem@x.y.z]
  `)
})

test('ox error as cause', async () => {
  const Hex = await import('ox/Hex')
  const cause = (() => {
    try {
      Hex.fromNumber(-1)
      return undefined
    } catch (error) {
      return error as Error
    }
  })()
  expect(new BaseError('An error occurred.', { cause })).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Details: Number \`-1\` is not in safe unsigned integer range (\`0\` to \`9007199254740991\`)
    Version: viem@x.y.z]
  `)
})

test('walk: no predicate fn (walks to leaf)', () => {
  class FooError extends BaseError<Error | undefined> {}
  class BarError extends BaseError {}

  const err = new BaseError('test1', {
    cause: new FooError('test2', { cause: new BarError('test3') }),
  })
  expect(err.walk()).toMatchInlineSnapshot(`
    [BaseError: test3

    Version: viem@x.y.z]
  `)
})

test('walk: predicate fn', () => {
  class FooError extends BaseError<Error | undefined> {}
  class BarError extends BaseError {}

  const err = new BaseError('test1', {
    cause: new FooError('test2', { cause: new BarError('test3') }),
  })
  expect(err.walk((err) => err instanceof FooError)).toMatchInlineSnapshot(`
    [BaseError: test2

    Details: test3
    Version: viem@x.y.z]
  `)
})

test('walk: predicate fn (no match)', () => {
  class FooError extends BaseError<Error | undefined> {}
  class BarError extends BaseError {}

  const err = new BaseError('test1', {
    cause: new Error('test2', { cause: new BarError('test3') }),
  })
  expect(err.walk((err) => err instanceof FooError)).toBeNull()
})

test('walk: undefined cause', () => {
  const withCauseUndefined = new Error('Cause undefined', { cause: undefined })

  const err = new BaseError('test1', {
    cause: withCauseUndefined,
  })
  expect(err.walk()).toBe(withCauseUndefined)
})

test('setConfig', () => {
  class FooError extends BaseError {
    override name = 'FooError'
    constructor() {
      super('An error occurred', { docsPath: '/xyz' })
    }
  }

  setConfig({
    docsOrigin: 'https://sweetlib.com',
    version: 'sweetlib@1.2.3',
  })

  expect(new BaseError('An error occurred.')).toMatchInlineSnapshot(`
    [BaseError: An error occurred.

    Version: sweetlib@1.2.3]
  `)
  expect(new FooError()).toMatchInlineSnapshot(`
    [FooError: An error occurred

    See: https://sweetlib.com/xyz
    Version: sweetlib@1.2.3]
  `)

  // merge semantics: a partial update leaves other defaults in place
  setConfig({ version: undefined })
  expect(new FooError()).toMatchInlineSnapshot(`
    [FooError: An error occurred

    See: https://sweetlib.com/xyz]
  `)

  setConfig({ docsOrigin: 'https://viem.sh', version: 'viem@x.y.z' })
})
