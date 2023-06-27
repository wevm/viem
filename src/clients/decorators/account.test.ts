import { describe, expect, test } from 'vitest'

import { walletClient } from '../../_test/utils.js'

import { accountActions } from './account.js'

test('default', async () => {
  expect(accountActions(walletClient as any)).toMatchInlineSnapshot(`
    {
      "withJsonRpcAccount": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('withJsonRpcAccount', async () => {
    expect(walletClient.account).toBeUndefined()
    expect(
      (await walletClient.withJsonRpcAccount()).account,
    ).toMatchInlineSnapshot(`
      {
        "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "json-rpc",
      }
    `)
  })
})
