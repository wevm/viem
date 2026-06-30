import { expect, test } from 'vitest'
import { Account, Actions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const address = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
const client = anvil.getWalletClient(anvil.mainnet)

test('default', async () => {
  const authorization = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
    chainId: 1,
    nonce: 0n,
  })
  expect(authorization).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 0n,
    }
  `)
})

test('behavior: partial authorization: no chainId + nonce', async () => {
  const authorization = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
  })
  expect(authorization).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 953n,
    }
  `)
})

test('behavior: partial authorization: no nonce', async () => {
  const authorization = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
    chainId: 10,
  })
  expect(authorization).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 10,
      "nonce": 953n,
    }
  `)
})

test('behavior: partial authorization: no chainId', async () => {
  const authorization = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
    nonce: 69n,
  })
  expect(authorization).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 69n,
    }
  `)
})

test('behavior: executor (address)', async () => {
  const authorization = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
    executor: '0x0000000000000000000000000000000000000000',
  })
  const base = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
  })
  expect(authorization.nonce).toBe(base.nonce)
})

test('behavior: executor (account)', async () => {
  const authorization = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
    executor: Account.fromPrivateKey(constants.accounts[1].privateKey),
  })
  const base = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
  })
  expect(authorization.nonce).toBe(base.nonce)
})

test('behavior: executor (self-executing)', async () => {
  const base = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
  })
  {
    const authorization = await Actions.wallet.prepareAuthorization(client, {
      account,
      address,
      executor: 'self',
    })
    expect(authorization.nonce).toBe(base.nonce + 1n)
  }
  {
    const authorization = await Actions.wallet.prepareAuthorization(client, {
      account,
      address,
      executor: account,
    })
    expect(authorization.nonce).toBe(base.nonce + 1n)
  }
})

test('behavior: hoisted account on client', async () => {
  const client = anvil.getWalletClient(anvil.mainnet, { account })
  const authorization = await Actions.wallet.prepareAuthorization(client, {
    address,
    chainId: 1,
    nonce: 0n,
  })
  expect(authorization).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 0n,
    }
  `)
})

test('error: no account', async () => {
  await expect(() =>
    Actions.wallet.prepareAuthorization(client, {
      address,
      chainId: 1,
      nonce: 0n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Account.NotFoundError: Could not find an Account to execute with this Action.

    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@2.52.1]
  `)
})
