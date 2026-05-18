import { describe, expect, test } from 'vp/test'

import { getUrl, getVersion } from './errors.js'

describe('getUrl', () => {
  test('strips basic auth credentials', () => {
    expect(getUrl('https://user:pass@example.com/rpc')).toMatchInlineSnapshot(
      `"https://example.com/rpc"`,
    )
  })

  test('returns invalid URLs unchanged', () => {
    expect(getUrl('not a url')).toMatchInlineSnapshot(`"not a url"`)
  })
})

describe('getVersion', () => {
  test('returns the package version', () => {
    expect(getVersion()).toMatchInlineSnapshot(`"2.49.3"`)
  })
})
