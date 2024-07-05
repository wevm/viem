import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../../../test/src/anvil.js'
import { bundlerActions } from './bundler.js'

const client = anvilMainnet.getClient().extend(bundlerActions())

test('default', async () => {
  expect(bundlerActions()(client)).toMatchInlineSnapshot(`
    {
      "estimateUserOperationGas": [Function],
      "getChainId": [Function],
      "getSupportedEntryPoints": [Function],
      "prepareUserOperationRequest": [Function],
      "sendUserOperation": [Function],
    }
  `)
})

describe('smoke', () => {
  test('getChainId', async () => {
    expect(await client.getChainId()).toMatchInlineSnapshot('1')
  })
})
