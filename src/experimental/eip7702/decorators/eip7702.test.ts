import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { eip7702Actions } from './eip7702.js'

const client = anvilMainnet
  .getClient({ account: privateKeyToAccount(accounts[0].privateKey) })
  .extend(eip7702Actions())

test('default', async () => {
  expect(eip7702Actions()(client)).toMatchInlineSnapshot(`
    {
      "prepareAuthorization": [Function],
      "signAuthorization": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('getCapabilities', async () => {
    await client.signAuthorization({
      contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    })
  })
})
