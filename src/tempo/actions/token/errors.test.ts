import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions, TempoExecutionError } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

test('behavior: unauthorized minter', async () => {
  const { token } = await tempo.setupToken(client)

  const error = await Actions.token
    .mint(tempo.getClient({ account: account3, feeToken: tempo.pathUsd }), {
      amount: 1n,
      to: account3.address,
      token,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.token.TokenUnauthorizedError)
  expect(error).toBeInstanceOf(TempoExecutionError)
  const { account: errorAccount, errorName, hints, name, role } = error
  expect({
    account: errorAccount,
    errorName,
    hints,
    name,
    role,
  }).toMatchInlineSnapshot(`
    {
      "account": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "errorName": "Unauthorized",
      "hints": [
        "Minting requires the issuer role. Grant it to this account first.",
        "The account lacks the permission this call requires.",
      ],
      "name": "TokenUnauthorizedError",
      "role": "issuer",
    }
  `)
})

test('behavior: insufficient balance', async () => {
  const { token } = await tempo.setupToken(client)

  const error = await Actions.token
    .transferSync(client, {
      amount: Value.from('20000', 6),
      to: account2.address,
      token,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.token.TokenInsufficientBalanceError)
  const { available, decimals, errorName, name, required } = error
  expect({
    available,
    decimals,
    errorName,
    name,
    required,
  }).toMatchInlineSnapshot(`
    {
      "available": 10000000000n,
      "decimals": 6,
      "errorName": "InsufficientBalance",
      "name": "TokenInsufficientBalanceError",
      "required": 20000000000n,
    }
  `)
  expect(error.token.toLowerCase()).toBe(token.toLowerCase())
})

test('behavior: insufficient allowance', async () => {
  const { token } = await tempo.setupToken(client)

  const error = await Actions.token
    .transferSync(
      tempo.getClient({ account: account2, feeToken: tempo.pathUsd }),
      {
        amount: Value.from('1', 6),
        from: account.address,
        to: account2.address,
        token,
      },
    )
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.token.TokenInsufficientAllowanceError)
  const { allowance, amount, name, owner, spender } = error
  expect({ allowance, amount, name, owner, spender }).toMatchInlineSnapshot(`
    {
      "allowance": 0n,
      "amount": 1000000n,
      "name": "TokenInsufficientAllowanceError",
      "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    }
  `)
})
