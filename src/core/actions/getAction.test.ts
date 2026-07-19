import { expect, test } from 'vitest'

import { Account, Actions, publicActions, walletActions } from 'viem'
import { Abi } from 'viem/utils'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)

test('default: falls back to the standalone action bound to the client', async () => {
  const balance = await Actions.getAction(
    client,
    Actions.address.getBalance,
    'address.getBalance',
  )({ address: constants.accounts[0].address })
  expect(balance).toEqual(
    await Actions.address.getBalance(client, {
      address: constants.accounts[0].address,
    }),
  )
})

test('behavior: uses the client-attached action at `path`', async () => {
  const extended = client.extend(() => ({
    transaction: {
      async send(_options: Actions.transaction.send.Options) {
        return '0x0000000000000000000000000000000000000000000000000000000000000045' as const
      },
    },
  }))
  const hash = await Actions.getAction(
    extended,
    Actions.transaction.send,
    'transaction.send',
  )({ to: constants.accounts[1].address, value: 0n })
  expect(hash).toBe(
    '0x0000000000000000000000000000000000000000000000000000000000000045',
  )
})

test('behavior: ignores non-function values at `path`', async () => {
  const extended = client.extend(() => ({
    address: { getBalance: 'not a function' },
  }))
  const balance = await Actions.getAction(
    extended,
    Actions.address.getBalance,
    'address.getBalance',
  )({ address: constants.accounts[0].address })
  expect(balance).toEqual(
    await Actions.address.getBalance(client, {
      address: constants.accounts[0].address,
    }),
  )
})

test('behavior: client-attached action returning a nullish value is used', () => {
  const extended = client.extend(() => ({
    foo: { bar: () => null },
  }))
  const result = Actions.getAction(
    extended,
    (_client, _options: object) => true,
    'foo.bar',
  )({})
  expect(result).toBeNull()
})

test('behavior: `contract.read` consults a `call` override', async () => {
  const extended = client.extend(() => ({
    async call() {
      return {
        data: '0x0000000000000000000000000000000000000000000000000000000000000045',
      }
    },
  }))
  expect(
    await Actions.contract.read(extended, {
      abi: Abi.from(['function balanceOf(address) view returns (uint256)']),
      address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
      args: [constants.accounts[0].address],
      functionName: 'balanceOf',
    }),
  ).toBe(69n)
})

test('behavior: routes through stock decorator methods identically', async () => {
  const { address } = await contract.deploy(client, {
    bytecode: generated.Erc721.bytecode.object,
  })
  const extended = client.extend(publicActions()).extend(walletActions())

  const abi = generated.Erc721.abi
  const account = Account.fromPrivateKey(constants.accounts[0].privateKey)

  // Dispatches through the wallet decorator's `transaction.send` (non-recursive).
  const hash = await Actions.contract.write(extended, {
    abi,
    account,
    address,
    functionName: 'mint',
  })
  const transaction = await Actions.transaction.get(client, { hash })
  expect(transaction.input).toMatchInlineSnapshot(`"0x1249c58b"`)

  // Reads through the public decorator's `call` with identical results.
  expect(
    await Actions.contract.read(extended, {
      abi,
      address,
      functionName: 'totalSupply',
    }),
  ).toEqual(
    await Actions.contract.read(client, {
      abi,
      address,
      functionName: 'totalSupply',
    }),
  )
})

test('behavior: `contract.write` consults a `transaction.send` override', async () => {
  const { address } = await contract.deploy(client, {
    bytecode: generated.Erc721.bytecode.object,
  })

  const extended = client.extend((client) => ({
    transaction: {
      send: (options: Actions.transaction.send.Options) =>
        Actions.transaction.send(client, {
          ...options,
          dataSuffix: '0xdeadbeef',
        }),
    },
  }))
  const hash = await Actions.contract.write(extended, {
    abi: generated.Erc721.abi,
    account: Account.fromPrivateKey(constants.accounts[0].privateKey),
    address,
    functionName: 'mint',
  })

  const transaction = await Actions.transaction.get(client, { hash })
  expect(transaction.input.endsWith('deadbeef')).toBe(true)
})
