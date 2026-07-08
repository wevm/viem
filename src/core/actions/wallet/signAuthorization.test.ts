import { Address, Authorization, Secp256k1 } from 'ox'
import { expect, test } from 'vitest'
import { Account, Actions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'

const address = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const account = Account.fromPrivateKey(constants.accounts[0].privateKey)
const client = anvil.getWalletClient(anvil.mainnet)

function recovered(authorization: Authorization.Authorization<true>) {
  return Address.isEqual(
    Secp256k1.recoverAddress({
      payload: Authorization.getSignPayload(authorization),
      signature: authorization,
    }),
    account.address,
  )
}

test('default', async () => {
  const authorization = await Actions.wallet.signAuthorization(client, {
    account,
    address,
    chainId: 1,
    nonce: 0n,
  })
  const { r, s, yParity, ...rest } = authorization
  expect(rest).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 0n,
    }
  `)
  expect(r).toBeDefined()
  expect(s).toBeDefined()
  expect(yParity).toBeDefined()
  expect(recovered(authorization)).toBe(true)
})

test('behavior: partial authorization: no chainId + nonce', async () => {
  const authorization = await Actions.wallet.signAuthorization(client, {
    account,
    address,
  })
  const { r, s, yParity, ...rest } = authorization
  expect(rest).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 953n,
    }
  `)
  expect(recovered(authorization)).toBe(true)
})

test('behavior: partial authorization: no chainId', async () => {
  const authorization = await Actions.wallet.signAuthorization(client, {
    account,
    address,
    nonce: 69n,
  })
  const { r, s, yParity, ...rest } = authorization
  expect(rest).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 69n,
    }
  `)
  expect(recovered(authorization)).toBe(true)
})

test('behavior: self-executing', async () => {
  const base = await Actions.wallet.prepareAuthorization(client, {
    account,
    address,
  })
  const authorization = await Actions.wallet.signAuthorization(client, {
    account,
    address,
    executor: 'self',
  })
  expect(authorization.nonce).toBe(base.nonce + 1n)
  expect(recovered(authorization)).toBe(true)
})

test('behavior: hoisted account on client', async () => {
  const client = anvil.getWalletClient(anvil.mainnet, { account })
  const authorization = await Actions.wallet.signAuthorization(client, {
    address,
    chainId: 1,
    nonce: 0n,
  })
  const { r, s, yParity, ...rest } = authorization
  expect(rest).toMatchInlineSnapshot(`
    {
      "address": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
      "chainId": 1,
      "nonce": 0n,
    }
  `)
  expect(recovered(authorization)).toBe(true)
})

test('error: unsupported account type', async () => {
  await expect(() =>
    Actions.wallet.signAuthorization(client, {
      account: constants.accounts[0].address,
      address,
      chainId: 1,
      nonce: 0n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Actions.wallet.signAuthorization.AccountTypeNotSupportedError: Account type "json-rpc" is not supported.

    The \`signAuthorization\` Action does not support JSON-RPC Accounts.

    Version: viem@2.52.1]
  `)
})

test('error: no account', async () => {
  await expect(() =>
    Actions.wallet.signAuthorization(client, {
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
