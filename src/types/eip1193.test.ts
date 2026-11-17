import { expect, test } from 'vitest'

import { ProviderRpcError } from './eip1193.js'

test('ProviderRpcError', () => {
  const error = new ProviderRpcError(4001, 'User rejected the request.')

  expect(error).toMatchInlineSnapshot(
    `[ProviderRpcError: User rejected the request.]`,
  )
  expect(error.code).toMatchInlineSnapshot(`4001`)
  expect(error.details).toMatchInlineSnapshot(`"User rejected the request."`)
})
