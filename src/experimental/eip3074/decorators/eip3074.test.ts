import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import { keccak256 } from '../../../utils/index.js'
import { walletActionsEip3074 } from './eip3074.js'

const account = privateKeyToAccount(accounts[0].privateKey)

const client = anvilMainnet
  .getClient({ account: true })
  .extend(walletActionsEip3074())

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
      `"0x7d46f161b04dec4b71a566ef613e01caed7d8f9aa299229b4339e08de9697efa52e0badad53bfab07a71d39ba307298f6f312b52dd5c28a49875d55fbf6474711c"`,
    )
  })
})
