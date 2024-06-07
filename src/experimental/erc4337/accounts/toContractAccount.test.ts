import { expect, test } from 'vitest'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { toCoinbaseAccount } from './toContractAccount.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const account = toCoinbaseAccount({ owners: [accounts[0].address] })

  const account_2 = await account.setup?.(client)

  expect(account_2).toBe(account)
  expect(account.address).toMatchInlineSnapshot(
    `"0x4a19f755592bADcAe1AaA3c8E50E92Bbe3F3912f"`,
  )
})

test('default (async)', async () => {
  const account = await toCoinbaseAccount({
    owners: [accounts[0].address],
  }).setup(client)

  expect(account).toMatchInlineSnapshot(`
    {
      "address": "0x4a19f755592bADcAe1AaA3c8E50E92Bbe3F3912f",
      "setup": [Function],
      "type": "contract",
    }
  `)
  expect(account.address).toMatchInlineSnapshot(
    `"0x4a19f755592bADcAe1AaA3c8E50E92Bbe3F3912f"`,
  )
})

test('args: address', async () => {
  const account = toCoinbaseAccount({
    address: '0x0000000000000000000000000000000000000000',
    owners: [accounts[0].address],
  })

  expect(account.address).toMatchInlineSnapshot(
    `"0x0000000000000000000000000000000000000000"`,
  )
})

test('args: salt', async () => {
  const account_1 = await toCoinbaseAccount({
    owners: [accounts[0].address],
    salt: 1n,
  }).setup(client)
  const account_2 = await toCoinbaseAccount({
    owners: [accounts[0].address],
    salt: 2n,
  }).setup(client)

  expect(account_1.address).toMatchInlineSnapshot(
    `"0x0DAee0912a4c7E98740612AbBc841Ee93B7c9FbD"`,
  )
  expect(account_2.address).toMatchInlineSnapshot(
    `"0x3b5c706e516b38c541a6F0E8a7EC14FaeCce1fbE"`,
  )
})

test('error: access address before initialization', async () => {
  const account = toCoinbaseAccount({ owners: [accounts[0].address] })
  expect(() => account.address).toThrowErrorMatchingInlineSnapshot(
    '[Error: `account.setup()` must be called before accessing `account.address`.]',
  )
})
