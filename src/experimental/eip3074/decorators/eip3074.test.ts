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
        commit: keccak256('0x1234'),
        invokerAddress: '0x0000000000000000000000000000000000000000',
      }),
    ).toMatchInlineSnapshot(
      `"0x15039b7939c1d4f007a323256ef4861e1241c861cf1c1cfa7db59cfce6cc5df011b86670db3f9f61c38390cce14a438758d457f375a23c10705dc7dbf5fb1e061b"`,
    )
  })
})
