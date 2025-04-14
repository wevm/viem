import { expect, test } from 'vitest'
import {
  ERC7821Example,
  ErrorsExample,
} from '../../../../contracts/generated.js'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { accounts } from '../../../../test/src/constants.js'
import { deploy, deployErrorExample } from '../../../../test/src/utils.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  getBalance,
  getTransactionReceipt,
  mine,
  readContract,
  signAuthorization,
} from '../../../actions/index.js'
import { decodeEventLog, parseEther } from '../../../utils/index.js'
import { executeBatches } from './executeBatches.js'

const client = anvilMainnet.getClient({
  account: privateKeyToAccount(accounts[1].privateKey),
})

test('default', async () => {
  const { contractAddress } = await deploy(client, {
    abi: ERC7821Example.abi,
    bytecode: ERC7821Example.bytecode.object,
  })

  const balances_before = await Promise.all([
    getBalance(client, { address: accounts[1].address }),
    getBalance(client, { address: accounts[2].address }),
    getBalance(client, { address: accounts[3].address }),
    readContract(client, {
      abi: wagmiContractConfig.abi,
      address: wagmiContractConfig.address,
      functionName: 'balanceOf',
      args: [accounts[1].address],
    }),
  ])

  const authorization = await signAuthorization(client, {
    contractAddress: contractAddress!,
    executor: 'self',
  })
  await executeBatches(client, {
    authorizationList: [authorization],
    address: client.account.address,
    batches: [
      {
        calls: [
          {
            to: accounts[2].address,
            value: parseEther('1'),
          },
        ],
      },
      {
        calls: [
          {
            to: accounts[3].address,
            value: parseEther('2'),
          },
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: wagmiContractConfig.address,
          },
        ],
      },
    ],
  })

  await mine(client, { blocks: 1 })

  const balances_after = await Promise.all([
    getBalance(client, { address: accounts[1].address }),
    getBalance(client, { address: accounts[2].address }),
    getBalance(client, { address: accounts[3].address }),
    readContract(client, {
      abi: wagmiContractConfig.abi,
      address: wagmiContractConfig.address,
      functionName: 'balanceOf',
      args: [accounts[1].address],
    }),
  ])

  expect(balances_after[0]).toBeLessThan(balances_before[0] - parseEther('3'))
  expect(balances_after[1]).toBe(balances_before[1] + parseEther('1'))
  expect(balances_after[2]).toBe(balances_before[2] + parseEther('2'))
  expect(balances_after[3]).toBe(balances_before[3] + 1n)
})

test('args: opData', async () => {
  const hash = await executeBatches(client, {
    address: client.account.address,
    batches: [
      {
        calls: [
          {
            to: accounts[2].address,
            value: parseEther('1'),
          },
          {
            to: accounts[3].address,
            value: parseEther('2'),
          },
        ],
        opData: '0xdeadbeef',
      },
      {
        calls: [
          {
            to: accounts[4].address,
            value: parseEther('1'),
          },
        ],
        opData: '0xcafebabe',
      },
    ],
  })
  await mine(client, { blocks: 1 })
  const receipt = await getTransactionReceipt(client, { hash })
  const events = receipt?.logs.map((log) =>
    decodeEventLog({
      abi: ERC7821Example.abi,
      ...log,
    }),
  )
  expect(events?.[0].args.opData).toBe('0xdeadbeef')
  expect(events?.[1].args.opData).toBe('0xcafebabe')
})

test('behavior: execution not supported', async () => {
  await expect(() =>
    executeBatches(client, {
      address: '0x0000000000000000000000000000000000000000',
      batches: [
        {
          calls: [
            {
              to: accounts[2].address,
              value: 0n,
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ExecuteUnsupportedError: ERC-7821 execution is not supported.

    Version: viem@x.y.z]
  `)
})

test('behavior: insufficient funds', async () => {
  await expect(() =>
    executeBatches(client, {
      address: client.account.address,
      batches: [
        {
          calls: [
            {
              to: accounts[2].address,
              value: parseEther('999999'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [TransactionExecutionError: Execution reverted for an unknown reason.

    Request Arguments:
      from:  0x70997970C51812dc3A010C7d01b50e0d17dc79C8
      to:    0x70997970C51812dc3A010C7d01b50e0d17dc79C8
      data:  0xe9ae5c5301000000000078210002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc00000000000000000000000000000000000000000000d3c20dee1639f99c000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000

    Details: execution reverted
    Version: viem@x.y.z]
  `)
})

test('behavior: unknown selector', async () => {
  await expect(() =>
    executeBatches(client, {
      address: client.account.address,
      batches: [
        {
          calls: [
            {
              to: accounts[2].address,
              value: parseEther('1'),
            },
            {
              to: accounts[3].address,
              value: parseEther('2'),
            },
          ],
        },
        {
          calls: [
            {
              abi: ErrorsExample.abi,
              functionName: 'simpleCustomRead',
              to: '0x0000000000000000000000000000000000000000',
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [FunctionSelectorNotRecognizedError: Function is not recognized.

    This could be due to any of the following:
      - The contract does not have the function,
      - The address is not a contract.

    Version: viem@x.y.z]
  `)
})

test('behavior: revert', async () => {
  const { contractAddress: errorExampleAddress } = await deployErrorExample()

  await expect(() =>
    executeBatches(client, {
      address: client.account.address,
      batches: [
        {
          calls: [
            {
              to: accounts[2].address,
              value: parseEther('1'),
            },
            {
              to: accounts[3].address,
              value: parseEther('2'),
            },
          ],
        },
        {
          calls: [
            {
              abi: ErrorsExample.abi,
              functionName: 'complexCustomWrite',
              to: errorExampleAddress!,
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "complexCustomWrite" reverted.

    Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                       ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  complexCustomWrite()

    Version: viem@x.y.z]
  `)
})
