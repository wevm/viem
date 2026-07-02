import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { expect, test } from 'vitest'

import { Actions, Client, custom, testActions } from 'viem'

const client = anvil.getClient(anvil.local)

const target = constants.accounts[8].address

test('default mode (anvil)', async () => {
  const decorated = client.extend(testActions())

  await decorated.address.setBalance({
    address: target,
    value: 420n,
  })

  await expect(
    Actions.address.getBalance(client, { address: target }),
  ).resolves.toBe(420n)
})

test('args: mode (threads into every mode-prefixed request)', async () => {
  const methods: string[] = []

  const decorated = Client.create({
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        methods.push(method)
        return client.request({ method, params } as never)
      },
    }),
  }).extend(testActions({ mode: 'hardhat' }))

  await decorated.block.mine({ blocks: 1 })
  await decorated.address.setBalance({
    address: target,
    value: 69n,
  })
  // Mode-independent methods stay unprefixed.
  await decorated.block.increaseTime({ seconds: 1 })

  expect(methods).toMatchInlineSnapshot(`
    [
      "hardhat_mine",
      "hardhat_setBalance",
      "evm_increaseTime",
    ]
  `)
})
