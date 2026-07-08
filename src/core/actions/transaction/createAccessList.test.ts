import { AbiFunction, Value } from 'ox'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { expect, test } from 'vitest'

import { Actions, Client, custom } from 'viem'

const client = anvil.getClient(anvil.mainnet)

const wagmiAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

test('creates access list', async () => {
  const result = await Actions.transaction.createAccessList(client, {
    data: '0x06fdde03',
    to: wagmiAddress,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
      ],
      "gasUsed": 26671n,
    }
  `)
})

test('args: blockNumber', async () => {
  const result = await Actions.transaction.createAccessList(client, {
    blockNumber: anvil.mainnet.forkBlockNumber,
    data: '0x06fdde03',
    to: wagmiAddress,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
      ],
      "gasUsed": 26671n,
    }
  `)
})

test('args: account', async () => {
  const result = await Actions.transaction.createAccessList(client, {
    account: constants.accounts[0].address,
    data: '0x06fdde03',
    to: wagmiAddress,
  })
  expect(result).toMatchInlineSnapshot(`
    {
      "accessList": [
        {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "storageKeys": [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
      ],
      "gasUsed": 26671n,
    }
  `)
})

test('behavior: reverted call', async () => {
  await expect(
    Actions.transaction.createAccessList(client, {
      data: AbiFunction.encodeData(
        AbiFunction.from(
          'function safeTransferFrom(address, address, uint256)',
        ),
        [
          constants.accounts[0].address,
          constants.accounts[1].address,
          Value.fromEther('1'),
        ],
      ),
      to: wagmiAddress,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: Execution reverted with reason: ERC721: operator query for nonexistent token.

    Request Arguments:
      data:  0x42842e0e000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000de0b6b3a7640000
      to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2

    Details: execution reverted: ERC721: operator query for nonexistent token
    Version: viem@2.52.1]
  `)
})

test('behavior: response error', async () => {
  const client = Client.create({
    transport: custom({
      async request() {
        return {
          accessList: [],
          error: 'execution reverted: nope',
          gasUsed: '0x0',
        }
      },
    }),
  })

  await expect(
    Actions.transaction.createAccessList(client, {
      to: wagmiAddress,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: Execution reverted with reason: nope.

    Request Arguments:
      to:  0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2

    Details: execution reverted: nope
    Version: viem@2.52.1]
  `)
})
