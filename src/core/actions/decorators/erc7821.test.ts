import { expect, test } from 'vitest'

import { Account, Actions, erc7821Actions, testActions } from 'viem'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet).extend(erc7821Actions())
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const account = Account.fromPrivateKey(constants.accounts[0].privateKey)

const { address: delegate } = await contract.deploy(client, {
  bytecode: generated.Erc7821Example.bytecode.object,
})

test('default', async () => {
  expect(erc7821Actions()(client)).toMatchInlineSnapshot(`
    {
      "erc7821": {
        "execute": [Function],
        "executeBatches": [Function],
        "supportsExecutionMode": [Function],
      },
    }
  `)
})

test('decorates a client with erc7821 actions', async () => {
  const authorization = await Actions.wallet.signAuthorization(client, {
    account,
    address: delegate,
    executor: 'self',
  })
  await client.erc7821.execute({
    account,
    address: account.address,
    authorizationList: [authorization],
    calls: [
      {
        data: '0x',
        to: '0x0000000000000000000000000000000000000000',
        value: 0n,
      },
    ],
  })
  await testClient.block.mine({ blocks: 1 })

  await client.erc7821.executeBatches({
    account,
    address: account.address,
    batches: [
      {
        calls: [
          {
            data: '0x',
            to: '0x0000000000000000000000000000000000000000',
            value: 0n,
          },
        ],
      },
    ],
  })
  await testClient.block.mine({ blocks: 1 })

  expect(
    await client.erc7821.supportsExecutionMode({ address: account.address }),
  ).toBe(true)
})
