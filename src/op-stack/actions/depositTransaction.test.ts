import { beforeAll, expect, test } from 'vitest'
import { accounts } from '~test/src/constants.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import {
  getTransactionReceipt,
  mine,
  reset,
  setBalance,
  waitForTransactionReceipt,
} from '../../actions/index.js'
import { base, optimismSepolia, sepolia } from '../../chains/index.js'
import {
  http,
  createClient,
  decodeEventLog,
  encodePacked,
  parseEther,
} from '../../index.js'
import { portalAbi } from '../abis.js'
import { getL2TransactionHashes } from '../index.js'
import { buildDepositTransaction } from './buildDepositTransaction.js'
import { depositTransaction } from './depositTransaction.js'

const client = anvilMainnet.getClient()
const clientWithoutChain = anvilMainnet.getClient({
  chain: false,
})

beforeAll(async () => {
  await reset(client, {
    blockNumber: 18136086n,
    jsonRpcUrl: anvilMainnet.forkUrl,
  })
  await setBalance(client, {
    address: accounts[0].address,
    value: parseEther('10000'),
  })
})

test('default', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: { gas: 21000n, to: accounts[0].address },
    targetChain: base,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  const log = decodeEventLog({
    abi: portalAbi,
    eventName: 'TransactionDeposited',
    ...receipt.logs[0],
  })
  expect(log.args.opaqueData).toEqual(
    encodePacked(
      ['uint', 'uint', 'uint64', 'bool', 'bytes'],
      [0n, 0n, 21000n, false, '0x'],
    ),
  )
})

test('args: data', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: { data: '0xdeadbeef', gas: 21100n, to: accounts[0].address },
    targetChain: base,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  const log = decodeEventLog({
    abi: portalAbi,
    eventName: 'TransactionDeposited',
    ...receipt.logs[0],
  })
  expect(log.args.opaqueData).toEqual(
    encodePacked(
      ['uint', 'uint', 'uint64', 'bool', 'bytes'],
      [0n, 0n, 21100n, false, '0xdeadbeef'],
    ),
  )
})

test('args: gas', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: {
      gas: 69420n,
      to: accounts[0].address,
    },
    targetChain: base,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  const log = decodeEventLog({
    abi: portalAbi,
    eventName: 'TransactionDeposited',
    ...receipt.logs[0],
  })
  expect(log.args.opaqueData).toEqual(
    encodePacked(
      ['uint', 'uint', 'uint64', 'bool', 'bytes'],
      [0n, 0n, 69420n, false, '0x'],
    ),
  )
})

test('args: isCreation', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: {
      data: '0xdeadbeef',
      gas: 69_420n,
      isCreation: true,
    },
    targetChain: base,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  const log = decodeEventLog({
    abi: portalAbi,
    eventName: 'TransactionDeposited',
    ...receipt.logs[0],
  })
  expect(log.args.opaqueData).toEqual(
    encodePacked(
      ['uint', 'uint', 'uint64', 'bool', 'bytes'],
      [0n, 0n, 69420n, true, '0xdeadbeef'],
    ),
  )
})

test('args: gas', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: {
      gas: 21000n,
      to: accounts[0].address,
      value: 1n,
    },
    gas: 420_000n,
    targetChain: base,
  })
  expect(hash).toBeDefined()
})

test('args: gas (nullish)', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: {
      gas: 21000n,
      to: accounts[0].address,
      value: 1n,
    },
    gas: null,
    targetChain: base,
  })
  expect(hash).toBeDefined()
})

test('args: mint', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: {
      gas: 21000n,
      mint: 1n,
      to: accounts[0].address,
    },
    targetChain: base,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  const log = decodeEventLog({
    abi: portalAbi,
    eventName: 'TransactionDeposited',
    ...receipt.logs[0],
  })
  expect(log.args.opaqueData).toEqual(
    encodePacked(
      ['uint', 'uint', 'uint64', 'bool', 'bytes'],
      [1n, 1n, 21000n, false, '0x'],
    ),
  )
})

test('args: portalAddress', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: {
      gas: 21000n,
      to: accounts[0].address,
    },
    portalAddress: base.contracts.portal[1].address,
  })
  expect(hash).toBeDefined()
})

test('args: value', async () => {
  const hash = await depositTransaction(client, {
    account: accounts[0].address,
    request: {
      gas: 21000n,
      to: accounts[0].address,
      value: 1n,
    },
    targetChain: base,
  })
  expect(hash).toBeDefined()

  await mine(client, { blocks: 1 })

  const receipt = await getTransactionReceipt(client, {
    hash,
  })
  const log = decodeEventLog({
    abi: portalAbi,
    eventName: 'TransactionDeposited',
    ...receipt.logs[0],
  })
  expect(log.args.opaqueData).toEqual(
    encodePacked(
      ['uint', 'uint', 'uint64', 'bool', 'bytes'],
      [0n, 1n, 21000n, false, '0x'],
    ),
  )
})

test('args: nullish chain', async () => {
  const hash = await depositTransaction(clientWithoutChain, {
    account: accounts[0].address,
    request: { gas: 21000n, to: accounts[0].address },
    chain: null,
    targetChain: base,
  })
  expect(hash).toBeDefined()
})

test('error: insufficient funds', async () => {
  await expect(() =>
    depositTransaction(client, {
      account: accounts[0].address,
      request: {
        gas: 21000n,
        to: accounts[0].address,
        mint: parseEther('20000'),
      },
      targetChain: base,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.
     
    Estimate Gas Arguments:
      from:   0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:     0x49048044D57e1C92A77f79988d21Fa8fAF74E97e
      value:  20000 ETH
      data:   0xe9e05c42000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000043c33c19375648000000000000000000000000000000000000000000000000000000000000000005208000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  depositTransaction(address _to, uint256 _value, uint64 _gasLimit, bool _isCreation, bytes _data)
      args:                        (0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 20000000000000000000000, 21000, false, 0x)
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/estimateContractGas
    Details: Insufficient funds for gas * price + value
    Version: viem@x.y.z]
  `)
})

test('error: small gas', async () => {
  await expect(() =>
    depositTransaction(client, {
      account: accounts[0].address,
      request: {
        gas: 21000n,
        to: accounts[0].address,
      },
      targetChain: base,
      gas: 69n,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: Transaction creation failed.

    URL: http://localhost
    Request body: {"method":"eth_estimateGas","params":[{"data":"0xe9e05c42000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005208000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000","from":"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266","gas":"0x45","to":"0x49048044D57e1C92A77f79988d21Fa8fAF74E97e"}]}
     
    Estimate Gas Arguments:
      from:  0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
      to:    0x49048044D57e1C92A77f79988d21Fa8fAF74E97e
      data:  0xe9e05c42000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005208000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000
      gas:   69
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  depositTransaction(address _to, uint256 _value, uint64 _gasLimit, bool _isCreation, bytes _data)
      args:                        (0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 0, 21000, false, 0x)
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/estimateContractGas
    Details: Out of gas: gas required exceeds allowance: 69
    Version: viem@x.y.z]
  `)
})

test.skip(
  'e2e (sepolia)',
  async () => {
    const account = privateKeyToAccount(
      process.env.VITE_ACCOUNT_PRIVATE_KEY as `0x${string}`,
    )

    const client_opSepolia = createClient({
      chain: optimismSepolia,
      transport: http(),
    })
    const client_sepolia = createClient({
      account,
      chain: sepolia,
      transport: http(),
    })

    const request = await buildDepositTransaction(client_opSepolia, {
      mint: 69n,
      to: account.address,
    })

    const hash = await depositTransaction(client_sepolia, request)
    expect(hash).toBeDefined()

    const receipt = await waitForTransactionReceipt(client_sepolia, {
      hash,
    })

    const [l2Hash] = getL2TransactionHashes(receipt)

    await waitForTransactionReceipt(client_opSepolia, {
      hash: l2Hash,
    })
  },
  { timeout: 1800000 },
)
