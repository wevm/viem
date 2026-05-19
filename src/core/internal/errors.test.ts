import { describe, expect, test } from 'vp/test'

import { getUrl, getVersion } from './errors.js'

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
