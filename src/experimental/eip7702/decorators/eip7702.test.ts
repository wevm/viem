import { describe, expect, test } from 'vitest'

import { eip7702Actions } from './eip7702.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { accounts } from '../../../../test/src/constants.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'

const client = anvilMainnet
  .getClient({ account: privateKeyToAccount(accounts[0].privateKey) })
  .extend(eip7702Actions())

test('default', async () => {
  expect(eip7702Actions()(client)).toMatchInlineSnapshot(`
    {
      "signAuthorization": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('getCapabilities', async () => {
    expect(
      await client.signAuthorization({
        authorization: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
      }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
        "chainId": 1,
        "nonce": 663,
        "r": "0xd800df0d5b8a572b4780736f6ca3ef795d42caed68a1c5777ca16e9a609366e8",
        "s": "0x5ad1b9ecb4fb6209e0806686a5afc2870c62266bbd8cb5c1cf280ee52dae2c9a",
        "v": 27n,
        "yParity": 0,
      }
    `)
  })
})
