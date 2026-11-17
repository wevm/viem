import { Secp256k1 } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'
import * as faucet from './index.js'

const client = tempo.getClient({ feeToken: tempo.pathUsd })

test('fund', async () => {
  const account = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
  const hashes = await faucet.fund(client, { account })

  expect(hashes.length).toBeGreaterThan(0)
  expect(hashes.every((hash) => hash.startsWith('0x'))).toBe(true)
})

test('behavior: address as account', async () => {
  const account = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
  const hashes = await faucet.fund(client, { account: account.address })

  expect(hashes.length).toBeGreaterThan(0)
})

test('fundSync', async () => {
  const account = Account.fromSecp256k1(Secp256k1.randomPrivateKey())
  const receipts = await faucet.fundSync(client, { account })

  expect(receipts.length).toBeGreaterThan(0)
  expect(receipts.every((receipt) => receipt.status === 'success')).toBe(true)

  await expect(
    Actions.token.getBalance(client, {
      account,
      token: tempo.pathUsd,
    }),
  ).resolves.toMatchInlineSnapshot(`
    {
      "amount": 1000000000000n,
      "decimals": 6,
      "formatted": "1000000",
    }
  `)
})
