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
      `"0x197364580cfcfd78fcb15431dcb639abffbecbe10ca2405225a79252e88b64c41fbb6520bee93093d5d78e54133a48d2065563711c8e46745cb334f671f385211c"`,
    )
  })
})
