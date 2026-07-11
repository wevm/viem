import { AbiEvent, Value } from 'ox'
import { expect, test } from 'vitest'

import { Account, Actions, testActions } from 'viem'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'

const client = anvil.getClient(anvil.mainnet)
const testClient = anvil.getClient(anvil.mainnet).extend(testActions())

const account = Account.fromPrivateKey(constants.accounts[1].privateKey)

const { address: delegate } = await contract.deploy(client, {
  bytecode: generated.Erc7821Example.bytecode.object,
})
const writeExample = {
  abi: generated.WriteExample.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.WriteExample.bytecode.object,
    })
  ).address,
}
const errors = {
  abi: generated.ErrorsExample.abi,
  address: (
    await contract.deploy(client, {
      bytecode: generated.ErrorsExample.bytecode.object,
    })
  ).address,
}

test('default', async () => {
  const balances_before = await Promise.all([
    Actions.address.getBalance(client, {
      address: constants.accounts[1].address,
    }),
    Actions.address.getBalance(client, {
      address: constants.accounts[2].address,
    }),
    Actions.address.getBalance(client, {
      address: constants.accounts[3].address,
    }),
    Actions.address.getBalance(client, { address: writeExample.address }),
  ])

  const authorization = await Actions.wallet.signAuthorization(client, {
    account,
    address: delegate,
    executor: 'self',
  })
  await Actions.erc7821.executeBatches(client, {
    account,
    address: account.address,
    authorizationList: [authorization],
    batches: [
      {
        calls: [
          {
            to: constants.accounts[2].address,
            value: Value.fromEther('1'),
          },
        ],
      },
      {
        calls: [
          {
            to: constants.accounts[3].address,
            value: Value.fromEther('2'),
          },
          {
            abi: writeExample.abi,
            functionName: 'pay',
            to: writeExample.address,
            value: Value.fromEther('0.5'),
          },
        ],
      },
    ],
  })

  await testClient.block.mine({ blocks: 1 })

  const balances_after = await Promise.all([
    Actions.address.getBalance(client, {
      address: constants.accounts[1].address,
    }),
    Actions.address.getBalance(client, {
      address: constants.accounts[2].address,
    }),
    Actions.address.getBalance(client, {
      address: constants.accounts[3].address,
    }),
    Actions.address.getBalance(client, { address: writeExample.address }),
  ])

  expect(balances_after[0]).toBeLessThan(
    balances_before[0] - Value.fromEther('3.5'),
  )
  expect(balances_after[1]).toBe(balances_before[1] + Value.fromEther('1'))
  expect(balances_after[2]).toBe(balances_before[2] + Value.fromEther('2'))
  expect(balances_after[3]).toBe(balances_before[3] + Value.fromEther('0.5'))
})

test('args: opData', async () => {
  const hash = await Actions.erc7821.executeBatches(client, {
    account,
    address: account.address,
    batches: [
      {
        calls: [
          {
            to: constants.accounts[2].address,
            value: Value.fromEther('1'),
          },
          {
            to: constants.accounts[3].address,
            value: Value.fromEther('2'),
          },
        ],
        opData: '0xdeadbeef',
      },
      {
        calls: [
          {
            to: constants.accounts[4].address,
            value: Value.fromEther('1'),
          },
        ],
        opData: '0xcafebabe',
      },
    ],
  })
  await testClient.block.mine({ blocks: 1 })
  const receipt = await Actions.transaction.getReceipt(client, { hash })
  const event = AbiEvent.fromAbi(generated.Erc7821Example.abi, 'OpData')
  expect(AbiEvent.decode(event, receipt.logs[0]!).opData).toBe('0xdeadbeef')
  expect(AbiEvent.decode(event, receipt.logs[1]!).opData).toBe('0xcafebabe')
})

test('behavior: execution not supported', async () => {
  await expect(() =>
    Actions.erc7821.executeBatches(client, {
      account,
      address: '0x0000000000000000000000000000000000000000',
      batches: [
        {
          calls: [
            {
              to: constants.accounts[2].address,
              value: 0n,
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Actions.erc7821.ExecuteUnsupportedError: ERC-7821 execution is not supported.

    Version: viem@2.52.1]
  `)
})

test('behavior: insufficient funds', async () => {
  await expect(() =>
    Actions.erc7821.executeBatches(client, {
      account,
      address: account.address,
      batches: [
        {
          calls: [
            {
              to: constants.accounts[2].address,
              value: Value.fromEther('999999'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: Execution reverted for an unknown reason.

    Request Arguments:
      from:  0x70997970C51812dc3A010C7d01b50e0d17dc79C8
      data:  0xe9ae5c5301000000000078210002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc00000000000000000000000000000000000000000000d3c20dee1639f99c000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
      to:    0x70997970C51812dc3A010C7d01b50e0d17dc79C8

    Details: execution reverted
    Version: viem@2.52.1]
  `)
})

test('behavior: unknown selector', async () => {
  await expect(() =>
    Actions.erc7821.executeBatches(client, {
      account,
      address: account.address,
      batches: [
        {
          calls: [
            {
              to: constants.accounts[2].address,
              value: Value.fromEther('1'),
            },
          ],
        },
        {
          calls: [
            {
              abi: errors.abi,
              functionName: 'simpleCustomRead',
              to: '0x0000000000000000000000000000000000000000',
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Actions.erc7821.FunctionSelectorNotRecognizedError: Function is not recognized.

    This could be due to any of the following:
      - The contract does not have the function,
      - The address is not a contract.

    Version: viem@2.52.1]
  `)
})

test('behavior: revert', async () => {
  await expect(() =>
    Actions.erc7821.executeBatches(client, {
      account,
      address: account.address,
      batches: [
        {
          calls: [
            {
              to: constants.accounts[2].address,
              value: Value.fromEther('1'),
            },
          ],
        },
        {
          calls: [
            {
              abi: errors.abi,
              functionName: 'complexCustomWrite',
              to: errors.address,
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "complexCustomWrite" reverted.

    Error: error ComplexError((address sender, uint256 bar) foo, string message, uint256 number)
                       ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
     
    Contract Call:
      address:   0x2e10a0a6383a084cc7449fe58d40d3702a8e57f4
      function:  function complexCustomWrite()
      sender:    0x70997970C51812dc3A010C7d01b50e0d17dc79C8
     
    Request Arguments:
      from:  0x70997970C51812dc3A010C7d01b50e0d17dc79C8
      data:  0xe9ae5c530100000000007821000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000002e10a0a6383a084cc7449fe58d40d3702a8e57f40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000048de18b9100000000000000000000000000000000000000000000000000000000
      to:    0x70997970C51812dc3A010C7d01b50e0d17dc79C8

    Details: execution reverted: custom error 0xdb731cf4: 000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000450000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000066275676765720000000000000000000000000000000000000000000000000000
    Version: viem@2.52.1]
  `)
})
