import { describe, expect, test } from 'vitest'

import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { mainnet } from '../../../chains/index.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { keccak256 } from '../../../utils/index.js'
import { walletActionsEip3074 } from './eip3074.js'

const account = privateKeyToAccount(accounts[0].privateKey)

const client = createClient({
  account: '0x',
  chain: mainnet,
  transport: http(),
}).extend(walletActionsEip3074())

test('default', async () => {
  expect(walletActionsEip3074()(client)).toMatchInlineSnapshot(`
    {
      "signAuthMessage": [Function],
    }
  `)
})

describe('smoke test', () => {
  test('signAuthMessage', async () => {
    expect(
      await client.signAuthMessage({
        account,
        chainId: 1,
        commit: keccak256('0x1234'),
        invokerAddress: '0x0000000000000000000000000000000000000000',
        nonce: 69,
      }),
    ).toMatchInlineSnapshot(
      `"0xfcd6431fe0dadb937bf232178cf20663c4704ba2a545775723d6c9267d5e40162f2264c10f76c6df7608ab02c453721c841b03525a30b0bc99ebdbdb0e160f351c"`,
    )
  })
})
