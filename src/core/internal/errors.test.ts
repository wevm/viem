import { describe, expect, test } from 'vp/test'

import { getAbortError, getUrl, getVersion, isAbortError } from './errors.js'

describe('getAbortError', () => {
  test('behavior: returns signal reason when present', () => {
    const controller = new AbortController()
    controller.abort(new Error('boom'))

    expect(getAbortError(controller.signal)).toMatchInlineSnapshot(
      `[Error: boom]`,
    )
  })

  test('behavior: creates an AbortError', () => {
    const error = getAbortError()

    expect({
      message: error.message,
      name: error.name,
    }).toMatchInlineSnapshot(`
      {
        "message": "This operation was aborted",
        "name": "AbortError",
      }
    `)
  })
})

describe('getUrl', () => {
  test('behavior: returns URLs without credentials unchanged', () => {
    expect(getUrl('https://example.com/rpc')).toMatchInlineSnapshot(
      `"https://example.com/rpc"`,
    )
  })

  test('behavior: strips basic auth credentials', () => {
    expect(getUrl('https://user:pass@example.com/rpc')).toMatchInlineSnapshot(
      `"https://example.com/rpc"`,
    )
  })

  test('behavior: returns invalid URLs unchanged', () => {
    expect(getUrl('not a url')).toMatchInlineSnapshot(`"not a url"`)
  })
})

describe('getVersion', () => {
  test('behavior: returns the package version', () => {
    expect(getVersion()).toMatchInlineSnapshot(`"2.49.3"`)
  })
})

describe('isAbortError', () => {
  test('behavior: returns true for AbortError values', () => {
    const error = new Error('boom')
    error.name = 'AbortError'

    expect(isAbortError(error)).toMatchInlineSnapshot(`true`)
  })

  test('behavior: returns false for non-AbortError values', () => {
    expect(isAbortError(new Error('boom'))).toMatchInlineSnapshot(`false`)
  })
})
