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
      `"0x917c175db3bc31c095bd3a1f64b1302ca2582383ef68183fc998f61cc950660d4cb3d20b8bdcf32d8a3b6dcbe2a79a8f98bc683bdb97e3841aed288fc91661ff1c"`,
    )
  })
})
